from functools import wraps
import io
from os import getenv

from flask import abort, jsonify, request, current_app
from PIL import Image

from utils.graphql import (
    make_hasura_request,
    GET_PERSON_IMAGE_METADATA,
    UPDATE_PERSON_IMAGE_METADATA,
    GET_CRASH_DIAGRAM_METADATA,
    UPDATE_CRASH_DIAGRAM_METADATA,
)

from utils.user import get_user_email

AWS_S3_BUCKET_ENV = getenv("AWS_S3_BUCKET_ENV", "")
AWS_S3_BUCKET = getenv("AWS_S3_BUCKET", "")
AWS_S3_PERSON_IMAGE_LOCATION = f"{AWS_S3_BUCKET_ENV}/images/person"
AWS_S3_CRASH_DIAGRAM_LOCATION = f"{AWS_S3_BUCKET_ENV}/cr3s/crash_diagrams"


def validate_file_size(max_size_mb):
    """Decorator to limit file size for specific routes

    Args:
        max_size_mb (int): Maximum file size in megabytes
    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if "file" in request.files:
                file = request.files["file"]
                file.seek(0, 2)
                size = file.tell()
                file.seek(0)  # reset file pointer

                max_size_bytes = max_size_mb * 1024 * 1024
                if size > max_size_bytes:
                    abort(413, description=f"File must be smaller than {max_size_mb}MB")
            return f(*args, **kwargs)

        return decorated_function

    return decorator


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
    """Get the person record image metadata for a given person record ID"""
    res = make_hasura_request(
        query=GET_PERSON_IMAGE_METADATA, variables={"person_id": person_id}
    )
    return (
        res["people_by_pk"]["image_s3_object_key"],
        res["people_by_pk"]["image_original_filename"],
    )


def _get_person_image_url(person_id, s3):
    """Get a presigned S3 download URL for the given person record ID"""
    image_obj_key, image_original_filename = _get_person_image_metadata(person_id)

    if not image_obj_key:
        return jsonify(error=f"No image found for person ID: {person_id}"), 404

    url = get_presigned_url(image_obj_key, s3)
    return jsonify(url=url)


def _upsert_person_image(person_id, s3):
    """Handle a person image upsert.

    If the person record does not have any image metadata in the DB, the image is
    handled as new. Both the image file and `image_source` form data are required.

    If the person record has an existing image, the image file is optional and
    `image_source` is still required. If a file is provided, it will overwrite the
    previous image in S3.

    Args:
        person_id (int): The person record ID
        s3 (boto3.S3.client): The S3 client

    Returns:
        flask.Response: the request response
    """
    has_file = "file" in request.files
    image_source = request.form.get("image_source")
    image_original_obj_key, image_original_filename = _get_person_image_metadata(
        person_id
    )
    is_new = not image_original_obj_key

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

    image_new_obj_key = None

    if has_file:
        # save/update image in S3
        file = request.files["file"]
        image_new_obj_key = _handle_image_upload(person_id, file, s3)
        image_original_filename = file.filename

    # update hasura file metadata
    make_hasura_request(
        query=UPDATE_PERSON_IMAGE_METADATA,
        variables={
            "person_id": person_id,
            "object": {
                "image_s3_object_key": image_new_obj_key or image_original_obj_key,
                "image_source": image_source,
                "image_original_filename": image_original_filename,
                "updated_by": get_user_email(),
            },
        },
    )

    # delete old image of different file ext
    if (
        image_original_obj_key
        and image_new_obj_key
        and image_new_obj_key != image_original_obj_key
    ):
        # this will only happen if an image is being updated and its file extension has changed
        current_app.logger.info(
            f"Deleting old image: {AWS_S3_BUCKET}/{image_original_obj_key}"
        )
        s3.delete_object(Bucket=AWS_S3_BUCKET, Key=image_original_obj_key)

    status_code = 201 if is_new else 200
    return jsonify(success=True), status_code


def validate_and_process_image(file):
    """Validate image file and return processed image without EXIF data

    Args:
        file: Flask file object from request

    Returns:
        tuple: (PIL.Image without EXIF, original format, file extension)
    """
    img = get_valid_image(file)
    img_without_exif = strip_exif(img)
    ext = "jpg" if img.format.lower() == "jpeg" else img.format.lower()

    return img_without_exif, img.format, ext


def upload_image_to_s3(img, img_format, s3_object_key, content_type, s3):
    """Upload a PIL image to S3

    Args:
        img: PIL.Image object
        img_format: Image format (e.g., 'JPEG', 'PNG')
        s3_object_key: Full S3 object key/path
        content_type: MIME type
        s3: boto3 S3 client

    Returns:
        str: The S3 object key
    """
    img_buffer = io.BytesIO()
    img.save(img_buffer, format=img_format)
    img_buffer.seek(0)

    current_app.logger.info(f"Uploading image: {AWS_S3_BUCKET}/{s3_object_key}")

    try:
        s3.upload_fileobj(
            img_buffer,
            AWS_S3_BUCKET,
            s3_object_key,
            ExtraArgs={
                "ContentType": content_type or "image/jpeg",
            },
        )
    except Exception as e:
        current_app.logger.exception(str(e))
        abort(500, description="Upload failed")

    return s3_object_key


def delete_image_from_s3(s3_object_key, s3):
    """Delete an image from S3

    Args:
        s3_object_key: Full S3 object key/path
        s3: boto3 S3 client
    """
    current_app.logger.info(f"Deleting image: {AWS_S3_BUCKET}/{s3_object_key}")
    s3.delete_object(Bucket=AWS_S3_BUCKET, Key=s3_object_key)


def get_presigned_url(s3_object_key, s3, expires_in=3600):
    """Generate a presigned S3 download URL

    Args:
        s3_object_key: Full S3 object key/path
        s3: boto3 S3 client
        expires_in: URL expiration time in seconds

    Returns:
        str: Presigned URL
    """
    return s3.generate_presigned_url(
        ExpiresIn=expires_in,
        ClientMethod="get_object",
        Params={
            "Bucket": AWS_S3_BUCKET,
            "Key": s3_object_key,
        },
    )


def _handle_image_upload(person_id, file, s3):
    """Uploads a person image to S3 after validating and removing EXIF data"""
    img_without_exif, img_format, ext = validate_and_process_image(file)

    filename = f"{person_id}.{ext}"
    new_image_obj_key = f"{AWS_S3_PERSON_IMAGE_LOCATION}/{filename}"

    upload_image_to_s3(
        img_without_exif, img_format, new_image_obj_key, file.content_type, s3
    )

    return new_image_obj_key


def _delete_person_image(person_id, s3):
    """Delete an image from S3 and nullify its metadata in the db"""
    image_obj_key, image_original_filename = _get_person_image_metadata(person_id)

    if not image_obj_key:
        abort(404, description=f"No image found for person ID: {person_id}")

    try:
        delete_image_from_s3(image_obj_key, s3)

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


def _get_crash_diagram_metadata(record_locator):
    """Get the crash record diagram metadata for a given crash ID"""
    res = make_hasura_request(
        query=GET_CRASH_DIAGRAM_METADATA, variables={"record_locator": record_locator}
    )
    if res["crashes"]:
        return res["crashes"][0]["diagram_s3_object_key"]
    # not found
    return None


def _get_crash_diagram_image_url(record_locator, s3):
    """Get a presigned S3 download URL for the given crash record_locator"""
    diagram_obj_key = _get_crash_diagram_metadata(record_locator)

    if not diagram_obj_key:
        return (
            jsonify(error=f"No crash diagram found for crash ID: {record_locator}"),
            404,
        )

    url = get_presigned_url(diagram_obj_key, s3)
    return jsonify(url=url)


def _upsert_crash_diagram_image(record_locator, s3):
    """Handle a crash diagram image upsert"""
    if "file" not in request.files:
        return jsonify(error="Image file is required"), 400

    file = request.files["file"]
    diagram_original_obj_key = _get_crash_diagram_metadata(record_locator)

    # Process and upload the image
    img_without_exif, img_format, ext = validate_and_process_image(file)
    filename = f"{record_locator}.{ext}"
    new_diagram_obj_key = f"{AWS_S3_CRASH_DIAGRAM_LOCATION}/{filename}"

    upload_image_to_s3(
        img_without_exif, img_format, new_diagram_obj_key, file.content_type, s3
    )

    # Update hasura metadata
    make_hasura_request(
        query=UPDATE_CRASH_DIAGRAM_METADATA,
        variables={
            "record_locator": record_locator,
            "object": {
                "diagram_s3_object_key": new_diagram_obj_key,
                "updated_by": get_user_email(),
            },
        },
    )

    # Delete old image if file extension changed
    if diagram_original_obj_key and new_diagram_obj_key != diagram_original_obj_key:
        current_app.logger.info(
            f"Deleting old crash diagram: {AWS_S3_BUCKET}/{diagram_original_obj_key}"
        )
        delete_image_from_s3(diagram_original_obj_key, s3)

    return jsonify(success=True), 200


def _delete_crash_diagram_image(record_locator, s3):
    """Delete a crash diagram from S3 and clear metadata in the db"""
    diagram_obj_key = _get_crash_diagram_metadata(record_locator)

    if not diagram_obj_key:
        abort(404, description=f"No crash diagram found for crash ID: {record_locator}")

    try:
        delete_image_from_s3(diagram_obj_key, s3)

        # clear metadata in Hasura
        make_hasura_request(
            query=UPDATE_CRASH_DIAGRAM_METADATA,
            variables={
                "record_locator": record_locator,
                "object": {
                    "diagram_s3_object_key": None,
                    "updated_by": get_user_email(),
                },
            },
        )
        return jsonify(success=True), 200

    except Exception as e:
        current_app.logger.exception(str(e))
        abort(500, description="Delete failed")
