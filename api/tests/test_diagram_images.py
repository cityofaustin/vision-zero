"""Integration tests for crash diagram image endpoints"""

import pytest
import requests
from PIL import Image
import io
import os


@pytest.fixture
def test_crash_id():
    """Test crash ID that should exist in database"""
    return int(os.getenv("TEST_CRASH_ID", 358192))


@pytest.fixture
def api_url(api_base_url, test_crash_id):
    """URL for crash diagram endpoint"""
    return f"{api_base_url}/images/crash_diagram/{test_crash_id}"


@pytest.fixture
def cleanup_crash_diagram(test_crash_id, api_base_url, editor_user_headers):
    """Delete crash diagram after test."""
    yield
    try:
        url = f"{api_base_url}/images/crash_diagram/{test_crash_id}"
        requests.delete(url, headers=editor_user_headers)
    except Exception as e:
        print(f"⚠️ Warning: failed to cleanup crash diagram: {e}")
        pass


def test_new_diagram_upload_get_delete_flow(
    api_url, editor_user_headers, test_image_jpg, cleanup_crash_diagram
):
    """Test the complete upload -> get -> delete flow for a new crash diagram"""

    # Upload (create new)
    files = {"file": test_image_jpg}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Get presigned URL
    res = requests.get(api_url, headers=editor_user_headers)
    assert res.status_code == 200
    presigned_url = res.json()["url"]

    # Download from S3
    s3_res = requests.get(presigned_url)
    assert s3_res.status_code == 200
    img = Image.open(io.BytesIO(s3_res.content))
    assert img.size == (500, 500)

    # Delete
    res = requests.delete(api_url, headers=editor_user_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Verify deleted
    res = requests.get(api_url, headers=editor_user_headers)
    assert res.status_code == 404


def test_upload_png(
    api_url, editor_user_headers, test_image_png, cleanup_crash_diagram
):
    """Test uploading a PNG crash diagram."""
    files = {"file": test_image_png}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 200


def test_upsert_replace_existing(
    api_url,
    editor_user_headers,
    test_image_jpg,
    create_test_image,
    cleanup_crash_diagram,
):
    """Test replacing an existing crash diagram with a new image"""
    # First, create an image
    files = {"file": test_image_jpg}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 200

    # Create a new image with different dimensions
    updated_image = create_test_image(width=300, height=300, color="red")

    # Replace the image
    files = {"file": updated_image}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Verify the new image
    res = requests.get(api_url, headers=editor_user_headers)
    presigned_url = res.json()["url"]
    s3_res = requests.get(presigned_url)
    img = Image.open(io.BytesIO(s3_res.content))
    assert img.size == (300, 300)


def test_upsert_change_format(
    api_url, editor_user_headers, test_image_jpg, test_image_png, cleanup_crash_diagram
):
    """Test changing diagram format from JPEG to PNG."""
    # Upload JPEG
    files = {"file": test_image_jpg}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 200

    # Get the JPEG
    res = requests.get(api_url, headers=editor_user_headers)
    assert res.status_code == 200
    presigned_url_jpg = res.json()["url"]

    # Update to PNG
    files = {"file": test_image_png}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Verify the PNG is accessible
    res = requests.get(api_url, headers=editor_user_headers)
    assert res.status_code == 200

    # Verify the old JPEG is no longer found
    s3_res = requests.get(presigned_url_jpg)
    assert s3_res.status_code == 404


def test_upload_no_file(api_url, editor_user_headers):
    """Test error when no file provided."""
    res = requests.put(api_url, headers=editor_user_headers)
    assert res.status_code == 400
    assert "Image file is required" in res.json()["error"]


def test_upload_invalid_file(api_url, editor_user_headers):
    """Test error with non-image file."""
    fake = io.BytesIO(b"not an image")
    fake.name = "fake.jpg"
    files = {"file": fake}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 400
    assert "Invalid or corrupted image file" in res.json()["error"]


def test_upload_file_too_large(api_url, editor_user_headers):
    """Test error when file exceeds size limit."""
    # Create a buffer with 6MB of data
    buf = io.BytesIO(b"x" * (6 * 1024 * 1024))
    buf.name = "large.jpg"

    files = {"file": buf}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 413


def test_get_nonexistent(api_url, editor_user_headers):
    """Test getting a diagram that doesn't exist."""
    # Make sure no diagram exists
    requests.delete(api_url, headers=editor_user_headers)

    res = requests.get(api_url, headers=editor_user_headers)
    assert res.status_code == 404


def test_get_invalid_crash_id(api_base_url, editor_user_headers):
    """Test getting a diagram with a crash ID that contains alpha chars"""
    bad_url = f"{api_base_url}/images/crash_diagram/unsafe_id.png"
    res = requests.get(bad_url, headers=editor_user_headers)
    assert res.status_code == 404


def test_delete_nonexistent(api_url, editor_user_headers):
    """Test deleting a diagram that doesn't exist."""
    # Make sure no diagram exists
    requests.delete(api_url, headers=editor_user_headers)

    res = requests.delete(api_url, headers=editor_user_headers)
    assert res.status_code == 404


def test_readonly_user_can_get(
    api_url,
    read_only_user_headers,
    editor_user_headers,
    test_image_jpg,
    cleanup_crash_diagram,
):
    """Test that readonly users can GET crash diagrams."""
    # Upload as editor
    files = {"file": test_image_jpg}
    res = requests.put(api_url, files=files, headers=editor_user_headers)
    assert res.status_code == 200

    # Get as readonly
    res = requests.get(api_url, headers=read_only_user_headers)
    assert res.status_code == 200
    assert "url" in res.json()


def test_readonly_user_cannot_put(api_url, read_only_user_headers, test_image_jpg):
    """Test that readonly users cannot PUT crash diagrams."""
    files = {"file": test_image_jpg}
    res = requests.put(api_url, files=files, headers=read_only_user_headers)
    assert res.status_code == 403


def test_readonly_user_cannot_delete(api_url, read_only_user_headers):
    """Test that readonly users cannot DELETE crash diagrams."""
    res = requests.delete(api_url, headers=read_only_user_headers)
    assert res.status_code == 403
