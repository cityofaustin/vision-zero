import io
from os import getenv

from flask import abort, jsonify, request, current_app
from PIL import Image

from utils.graphql import (
    make_hasura_request,
    GET_PERSON_IMAGE_METADATA,
    UPDATE_PERSON_IMAGE_METADATA,
)

from utils.user import get_user_email

MAX_IMAGE_PIXELS = 5000

AWS_S3_BUCKET_ENV = getenv("AWS_S3_BUCKET_ENV", "")
AWS_S3_BUCKET = getenv("AWS_S3_BUCKET", "")
AWS_S3_PERSON_IMAGE_LOCATION = f"{AWS_S3_BUCKET_ENV}/images/person"


def get_valid_image(file):
    """Validate if a file blob is a valid image and return it as a PIL Image.

    Returns:
        PIL.Image: an image object
    """
    try:
        # validate image file
        file.seek(0)
        img = Image.open(file)
        img.verify()

        # validate actual image format
        file.seek(0)
        img = Image.open(file)
        actual_format = img.format.lower()

        if actual_format not in ["jpeg", "png"]:
            abort(400, description="Image format must be JPEG or PNG")

        # validate size limit
        width, height = img.size
        if width > MAX_IMAGE_PIXELS or height > MAX_IMAGE_PIXELS:
            abort(
                400,
                description="Image deimensions must not exceed {MAX_IMAGE_PIXELS}x{MAX_IMAGE_PIXELS}px",
            )

    except Exception as e:
        current_app.logger.error(e)
        abort(400, description="Invalid or corrupted image file")

    return img


def strip_exif(img):
    """Remove all EXIF data from an image

    Args:
        img (PIL.Image)

    Returns:
        PIL.Image: the image without EXIF data
    """
    img_without_exif = Image.new(img.mode, img.size)
    img_without_exif.putdata(list(img.getdata()))
    return img_without_exif


def _get_person_image_metadata(person_id):
    # get filename from DB
    res = make_hasura_request(
        query=GET_PERSON_IMAGE_METADATA, variables={"person_id": person_id}
    )
    return (
        res["people_by_pk"]["image_s3_object_key"],
        res["people_by_pk"]["image_original_filename"],
    )


def _get_person_image_url(person_id, s3):
    # get filename from DB
    image_obj_key, image_original_filename = _get_person_image_metadata(person_id)

    if not image_obj_key:
        return jsonify(error=f"No image found for person ID: {person_id}"), 404

    url = s3.generate_presigned_url(
        ExpiresIn=3600,
        ClientMethod="get_object",
        Params={
            "Bucket": AWS_S3_BUCKET,
            "Key": image_obj_key,
        },
    )
    return jsonify(url=url)


def _upsert_person_image(person_id, s3):
    has_file = "file" in request.files
    image_source = request.form.get("image_source")
    image_obj_key, image_original_filename = _get_person_image_metadata(person_id)
    is_new = not image_obj_key

    if not image_source and not has_file:
        return (
            jsonify(error="Image file and/or image_source are required"),
            400,
        )

    if is_new and not (has_file and image_source):
        return (
            jsonify(error="File and image_source are required for new image uploads"),
            400,
        )

    if not is_new and has_file and not image_source:
        return jsonify(error="Image source is required when updating an image"), 400

    if has_file:
        # save/update image in S3
        file = request.files["file"]
        image_obj_key = _handle_image_upload(
            person_id,
            file,
            s3,
            old_image_obj_key=None if is_new else image_obj_key,
        )
        image_original_filename = file.filename

    # update hasura file metadata
    make_hasura_request(
        query=UPDATE_PERSON_IMAGE_METADATA,
        variables={
            "person_id": person_id,
            "object": {
                "image_s3_object_key": image_obj_key,
                "image_source": image_source,
                "image_original_filename": image_original_filename,
                "updated_by": get_user_email(),
            },
        },
    )
    status_code = 201 if is_new else 200
    return jsonify(success=True), status_code


def _handle_image_upload(person_id, file, s3, old_image_obj_key=None):
    """Uploads an image to S3, deleting a previous image to s3

    Args:
        person_id (Int): The person ID of the image
        s3 (boto3.S3.client): The boto3 S3 client
        todo: update these docs

    Returns:
        flask.Response: Response object
    """

    # todo: delete old image file if it has a diff extension!
    img = get_valid_image(file)

    img_without_exif = strip_exif(img)

    # save clean image to buffer
    img_buffer = io.BytesIO()
    img_without_exif.save(img_buffer, format=img.format)
    img_buffer.seek(0)

    # prepare image metadata
    ext = "jpg" if img.format.lower() == "jpeg" else img.format.lower()
    filename = f"{person_id}.{ext}"
    new_image_obj_key = f"{AWS_S3_PERSON_IMAGE_LOCATION}/{filename}"

    if old_image_obj_key and new_image_obj_key != old_image_obj_key:
        # this will only happen if an image is being updated and its file extension has changed
        current_app.logger.info(
            f"Deleting old image: {AWS_S3_BUCKET}/{old_image_obj_key}"
        )
        s3.delete_object(Bucket=AWS_S3_BUCKET, Key=old_image_obj_key)

    current_app.logger.info(f"Uploading image: {AWS_S3_BUCKET}/{new_image_obj_key}")

    try:
        s3.upload_fileobj(
            img_buffer,
            AWS_S3_BUCKET,
            new_image_obj_key,
            ExtraArgs={
                "ContentType": file.content_type or "image/jpeg",
            },
        )

    except Exception as e:
        current_app.logger.exception(str(e))
        abort(500, description="Upload failed")

    return new_image_obj_key


def _delete_person_image(person_id, s3):
    image_obj_key, image_original_filename = _get_person_image_metadata(person_id)

    if not image_obj_key:
        abort(404, description=f"No image found for person ID: {person_id}")

    try:
        # delete object in S3
        s3.delete_object(Bucket=AWS_S3_BUCKET, Key=image_obj_key)

        # clear metadata in Hasura
        make_hasura_request(
            query=UPDATE_PERSON_IMAGE_METADATA,
            variables={
                "person_id": person_id,
                "object": {
                    "image_s3_object_key": None,
                    "image_source": None,
                    "image_original_filename": None,
                    "updated_by": get_user_email(),
                },
            },
        )
        return jsonify(success=True), 200

    except Exception as e:
        current_app.logger.exception(str(e))
        abort(500, description="Delete failed")
