"""Integration tests for person image endpoints"""

import os
import pytest
import requests
from PIL import Image
import io


@pytest.fixture
def api_url():
    base = os.getenv("API_BASE_URL", "http://cr3-user-api:5000")
    person_id = os.getenv("TEST_PERSON_ID", "102580")
    return f"{base}/images/person/{person_id}"


@pytest.fixture
def headers():
    token = os.getenv("TEST_AUTH_TOKEN")
    if not token:
        raise Exception("TEST_AUTH_TOKEN not set")
    return {"Authorization": token}


@pytest.fixture
def test_image():
    """Create a 500x500 test image."""
    img = Image.new("RGB", (500, 500), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    buf.name = "test.jpg"
    return buf


@pytest.fixture(autouse=True)
def cleanup(api_url, headers):
    """Delete test image after each test."""
    yield
    try:
        requests.delete(api_url, headers=headers)
    except:
        pass


def test_upload_get_delete_flow(api_url, headers, test_image):
    """Test the complete upload -> get -> delete flow."""

    # Upload
    files = {"file": test_image}
    data = {"image_source": "test_source", "image_original_filename": "test.jpg"}
    res = requests.post(api_url, files=files, headers=headers, data=data)
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


def test_upload_png(api_url, headers):
    """Test uploading a PNG image."""
    img = Image.new("RGB", (500, 500), color="green")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    buf.name = "test.png"

    files = {"file": buf}
    data = {"image_source": "test_source", "image_original_filename": "test.png"}
    res = requests.post(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 201


def test_upload_no_file(api_url, headers):
    """Test error when no file provided."""
    data = {
        "image_source": "test_source",
    }
    res = requests.post(api_url, headers=headers, data=data)
    assert res.status_code == 400
    assert "No file provided" in res.json()["error"]


def test_upload_missing_metadata(api_url, headers, test_image):
    """Test error when metadata is missing."""
    files = {"file": test_image}
    res = requests.post(api_url, files=files, headers=headers)
    assert res.status_code == 400
    assert "image_source is required" in res.json()["error"]


def test_upload_invalid_file(api_url, headers):
    """Test error with non-image file."""
    fake = io.BytesIO(b"not an image")
    fake.name = "fake.jpg"

    files = {"file": fake}
    data = {"image_source": "test_source", "image_original_filename": "fake.jpg"}
    res = requests.post(api_url, files=files, headers=headers, data=data)
    assert res.status_code == 400
    assert "Invalid or corrupted image file" in res.json()["error"]


def test_get_nonexistent(api_url, headers):
    """Test getting an image that doesn't exist."""
    # Make sure no image exists
    requests.delete(api_url, headers=headers)

    res = requests.get(api_url, headers=headers)
    assert res.status_code == 404


def test_delete_nonexistent(api_url, headers):
    """Test deleting an image that doesn't exist."""
    # Make sure no image exists
    requests.delete(api_url, headers=headers)

    res = requests.delete(api_url, headers=headers)
    assert res.status_code == 404
