"""Integration tests for person image endpoints"""

import os
import pytest
import requests
from PIL import Image
import io

# must be a person record ID available in your local DB
TEST_PERSON_ID = os.getenv("TEST_PERSON_ID", 102580)


@pytest.fixture
def api_url():
    # this host URL will only work within the docker compose setup
    base = os.getenv("API_BASE_URL", "http://cr3-user-api:5000")
    return f"{base}/images/person/{TEST_PERSON_ID}"


@pytest.fixture
def headers():
    token = os.getenv("TEST_AUTH_TOKEN")
    if not token:
        raise Exception("TEST_AUTH_TOKEN not set")
    return {"Authorization": token}


@pytest.fixture
def test_image_jpg():
    """Create a 500x500 JPEG test image."""
    img = Image.new("RGB", (500, 500), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    buf.name = "test.jpg"
    return buf


@pytest.fixture
def test_image_png():
    """Create a 500x500 PNG test image."""
    img = Image.new("RGB", (500, 500), color="green")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    buf.name = "test.png"
    return buf


@pytest.fixture(autouse=True)
def cleanup(api_url, headers):
    """Delete test image after each test."""
    yield
    try:
        requests.delete(api_url, headers=headers)
    except:
        pass


def test_new_image_upload_get_delete_flow(api_url, headers, test_image_jpg):
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


def test_upload_png(api_url, headers, test_image_png):
    """Test uploading a PNG image."""
    files = {"file": test_image_png}
    data = {"image_source": "test_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201


def test_upsert_update_source_only(api_url, headers, test_image_jpg):
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


def test_upsert_update_file(api_url, headers, test_image_jpg):
    """Test updating an existing image file with a new image and source"""
    # First, create an image
    files = {"file": test_image_jpg}
    data = {"image_source": "original_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201

    # Create a new image with different dimensions
    img = Image.new("RGB", (300, 300), color="red")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    buf.name = "updated.jpg"

    # Update the image file
    files = {"file": buf}
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


def test_upsert_change_format(api_url, headers, test_image_jpg, test_image_png):
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

    # Verify the old PNG is no longer found
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


def test_update_file_without_source(api_url, headers, test_image_jpg):
    """Test error when updating file without providing source."""
    # First, create an image
    files = {"file": test_image_jpg}
    data = {"image_source": "original_source"}
    res = requests.put(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201

    # Try to update file without source
    img = Image.new("RGB", (300, 300), color="red")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    buf.name = "updated.jpg"

    files = {"file": buf}
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


def test_get_invalid_person_id(api_url, headers):
    """Test getting an image that with a person ID that contains alpha chars"""
    base = os.getenv("API_BASE_URL", "http://cr3-user-api:5000")
    bad_url = f"{base}/images/person/unsafe_id.png"
    res = requests.get(bad_url, headers=headers)
    assert res.status_code == 404


def test_delete_nonexistent(api_url, headers):
    """Test deleting an image that doesn't exist."""
    # Make sure no image exists
    requests.delete(api_url, headers=headers)

    res = requests.delete(api_url, headers=headers)
    assert res.status_code == 404
