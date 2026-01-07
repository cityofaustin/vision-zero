"""Integration tests for person image endpoints"""

import pytest
import requests
from PIL import Image
import io


@pytest.fixture
def api_url(api_base_url, test_person_id):
    """URL for person image endpoint"""
    return f"{api_base_url}/images/person/{test_person_id}"


def test_new_image_upload_get_delete_flow(api_url, headers, test_image_jpg, cleanup_person_image):
    """Test the complete upload -> get -> delete flow for a new image"""

    # Upload (create new)
    files = {"file": test_image_jpg}
    data = {"image_source": "test_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201
    assert res.json()["success"] is True

    # Get presigned URL
    res = requests.get(api_url, headers=headers)
    assert res.status_code == 200
    presigned_url = res.json()["url"]

    # Download from S3
    s3_res = requests.get(presigned_url)
    assert s3_res.status_code == 200
    img = Image.open(io.BytesIO(s3_res.content))
    assert img.size == (500, 500)

    # Delete
    res = requests.delete(api_url, headers=headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Verify deleted
    res = requests.get(api_url, headers=headers)
    assert res.status_code == 404


def test_upload_png(api_url, headers, test_image_png, cleanup_person_image):
    """Test uploading a PNG image."""
    files = {"file": test_image_png}
    data = {"image_source": "test_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201


def test_upsert_update_source_only(api_url, headers, test_image_jpg, cleanup_person_image):
    """Test updating only the image_source without uploading a new file."""
    # First, create an image
    files = {"file": test_image_jpg}
    data = {"image_source": "original_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201

    # Update only the source
    data = {"image_source": "updated_source"}
    res = requests.put(api_url, headers=headers, data=data)
    assert res.status_code == 200
    assert res.json()["success"] is True


def test_upsert_update_file(api_url, headers, test_image_jpg, create_test_image, cleanup_person_image):
    """Test updating an existing image file with a new image and source"""
    # First, create an image
    files = {"file": test_image_jpg}
    data = {"image_source": "original_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201

    # Create a new image with different dimensions using the factory
    updated_image = create_test_image(width=300, height=300, color="red")

    # Update the image file
    files = {"file": updated_image}
    data = {"image_source": "updated_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Verify the new image
    res = requests.get(api_url, headers=headers)
    presigned_url = res.json()["url"]
    s3_res = requests.get(presigned_url)
    img = Image.open(io.BytesIO(s3_res.content))
    assert img.size == (300, 300)


def test_upsert_change_format(api_url, headers, test_image_jpg, test_image_png, cleanup_person_image):
    """Test changing image format from JPEG to PNG."""
    # Upload JPEG
    files = {"file": test_image_jpg}
    data = {"image_source": "jpeg_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201

    # Get the JPEG
    res = requests.get(api_url, headers=headers)
    assert res.status_code == 200
    presigned_url_jpg = res.json()["url"]

    # Update to PNG
    files = {"file": test_image_png}
    data = {"image_source": "png_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Verify the PNG is accessible
    res = requests.get(api_url, headers=headers)
    assert res.status_code == 200

    # Verify the old JPEG is no longer found
    s3_res = requests.get(presigned_url_jpg)
    assert s3_res.status_code == 404


def test_upload_no_file_no_source(api_url, headers):
    """Test error when neither file nor source provided."""
    res = requests.put(api_url, headers=headers)
    assert res.status_code == 400
    assert "Image file and/or image_source are required" in res.json()["error"]


def test_upload_new_no_file(api_url, headers):
    """Test error when creating new image without file."""
    data = {"image_source": "test_source"}
    res = requests.put(api_url, headers=headers, data=data)
    assert res.status_code == 400
    assert (
        "File and image_source are required for new image uploads"
        in res.json()["error"]
    )


def test_upload_new_no_source(api_url, headers, test_image_jpg):
    """Test error when creating new image without source."""
    files = {"file": test_image_jpg}
    res = requests.put(api_url, files=files, headers=headers)
    assert res.status_code == 400
    assert (
        "File and image_source are required for new image uploads"
        in res.json()["error"]
    )


def test_update_file_without_source(api_url, headers, test_image_jpg, create_test_image, cleanup_person_image):
    """Test error when updating file without providing source."""
    # First, create an image
    files = {"file": test_image_jpg}
    data = {"image_source": "original_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201

    # Try to update file without source
    updated_image = create_test_image(width=300, height=300, color="red")

    files = {"file": updated_image}
    res = requests.put(api_url, files=files, headers=headers)
    assert res.status_code == 400
    assert "Image source is required when updating an image" in res.json()["error"]


def test_upload_invalid_file(api_url, headers):
    """Test error with non-image file."""
    fake = io.BytesIO(b"not an image")
    fake.name = "fake.jpg"
    files = {"file": fake}
    data = {"image_source": "test_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 400
    assert "Invalid or corrupted image file" in res.json()["error"]


def test_upload_file_too_large(api_url, headers):
    """Test error when file exceeds size limit."""
    # Create a buffer with 6MB of data
    buf = io.BytesIO(b"x" * (6 * 1024 * 1024))
    buf.name = "large.jpg"

    files = {"file": buf}
    data = {"image_source": "test_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 413


def test_get_nonexistent(api_url, headers):
    """Test getting an image that doesn't exist."""
    # Make sure no image exists
    requests.delete(api_url, headers=headers)

    res = requests.get(api_url, headers=headers)
    assert res.status_code == 404


def test_get_invalid_person_id(api_base_url, headers):
    """Test getting an image with a person ID that contains alpha chars"""
    bad_url = f"{api_base_url}/images/person/unsafe_id.png"
    res = requests.get(bad_url, headers=headers)
    assert res.status_code == 404


def test_delete_nonexistent(api_url, headers):
    """Test deleting an image that doesn't exist."""
    # Make sure no image exists
    requests.delete(api_url, headers=headers)

    res = requests.delete(api_url, headers=headers)
    assert res.status_code == 404
