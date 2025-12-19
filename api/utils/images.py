import io
from os import getenv

from flask import jsonify, request, current_app
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
    """Validate if a file blob is a valid image

    returns tuple:
        - the PIL.Image or False if invalid
        - None if valid else an error message Str
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
            return False, "Image format must be JPEG or PNG"

        # validate size limit
        width, height = img.size
        if width > MAX_IMAGE_PIXELS or height > MAX_IMAGE_PIXELS:
            return (
                False,
                "Image deimensions must not exceed {MAX_IMAGE_PIXELS}x{MAX_IMAGE_PIXELS}px",
            )

    except Exception as e:
        current_app.logger.error(e)
        return False, "Invalid or corrupted image file"

    return img, None


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


def _get_person_image(person_id, s3):
    # get filename from DB
    res = make_hasura_request(
        query=GET_PERSON_IMAGE_METADATA, variables={"person_id": person_id}
    )
    obj_key = res["people_by_pk"]["image_s3_object_key"]

    if not obj_key:
        return jsonify(error=f"No image found for person ID: {person_id}"), 404

    url = s3.generate_presigned_url(
        ExpiresIn=3600,
        ClientMethod="get_object",
        Params={
            "Bucket": AWS_S3_BUCKET,
            "Key": obj_key,
        },
    )
    return jsonify(url=url)


def _create_person_image(person_id, s3):
    """Create new image - in s3 and DB - fails if an image
    already exists for the given person_id"""
    # Check if image already exists
    res = make_hasura_request(
        query=GET_PERSON_IMAGE_METADATA, variables={"person_id": person_id}
    )

    if res["people_by_pk"]["image_s3_object_key"]:
        return jsonify(error="Image already exists. Use PUT to update."), 409

    return _handle_image_upload(person_id, s3, is_create=True)


def _update_person_image(person_id, s3):
    """Update existing image and/or metadata"""
    has_file = "file" in request.files
    has_metadata = any(
        key in request.form for key in ["image_source", "image_original_filename"]
    )

    if not has_file and not has_metadata:
        return jsonify(error="Provide file and/or metadata to update"), 400

    # Check if image exists
    res = make_hasura_request(
        query=GET_PERSON_IMAGE_METADATA, variables={"person_id": person_id}
    )

    if not res["people_by_pk"]["image_s3_object_key"]:
        return jsonify(error="No image exists. Use POST to create."), 404

    if has_file:
        return _handle_image_upload(person_id, s3, is_create=False)
    else:
        # Just update metadata
        return _update_metadata_only(person_id)


def _handle_image_upload(safe_person_id, s3, is_create=True):
    if "file" not in request.files:
        return jsonify(error="No file provided"), 400

    file = request.files["file"]

    image_original_filename = file.filename
    image_source = request.form.get("image_source")

    if not image_source:
        return (
            jsonify(error="image_source is required"),
            400,
        )

    img, error_msg = get_valid_image(file)

    if not img:
        return jsonify(error=error_msg), 400

    img_without_exif = strip_exif(img)

    # convert image back to a file blob
    img_buffer = io.BytesIO()
    img_without_exif.save(img_buffer, format=img.format)
    img_buffer.seek(0)

    # prepare image metadata
    ext = "jpg" if img.format.lower() == "jpeg" else img.format.lower()
    filename = f"{safe_person_id}.{ext}"
    obj_key = f"{AWS_S3_PERSON_IMAGE_LOCATION}/{filename}"
    current_app.logger.info(f"Uploading image: {AWS_S3_BUCKET}/{obj_key}")

    try:
        s3.upload_fileobj(
            img_buffer,
            AWS_S3_BUCKET,
            obj_key,
            ExtraArgs={
                "ContentType": file.content_type or "image/jpeg",
            },
        )

    except Exception as e:
        current_app.logger.exception(str(e))
        return jsonify(error=f"Upload failed"), 500

    try:
        make_hasura_request(
            query=UPDATE_PERSON_IMAGE_METADATA,
            variables={
                "person_id": safe_person_id,
                "object": {
                    "image_s3_object_key": obj_key,
                    "image_source": image_source,
                    "image_original_filename": image_original_filename,
                    "updated_by": get_user_email(),
                },
            },
        )
        status_code = 201 if is_create else 200
        return jsonify(success=True), status_code

    except Exception as e:
        current_app.logger.exception(str(e))
        return jsonify(error=f"Upload failed"), 500


def _update_metadata_only(person_id):
    """Update only image_source without touching the image"""

    image_source = request.form["image_source"]
    if not image_source:
        return jsonify(error="Image source is missing"), 400

    make_hasura_request(
        query=UPDATE_PERSON_IMAGE_METADATA,
        variables={
            "person_id": person_id,
            "object": {"image_source": image_source, "updated_by": get_user_email()},
        },
    )

    return jsonify(success=True), 200


def _delete_person_image(person_id, s3):
    res = make_hasura_request(
        query=GET_PERSON_IMAGE_METADATA, variables={"person_id": person_id}
    )

    obj_key = res["people_by_pk"]["image_s3_object_key"]

    if not obj_key:
        return jsonify(error=f"No image found for person ID: {person_id}"), 404

    try:
        # delete object in S3
        s3.delete_object(Bucket=AWS_S3_BUCKET, Key=obj_key)

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
        return jsonify(error="Delete failed"), 500
