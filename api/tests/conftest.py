"""Shared pytest fixtures for API integration tests"""

import os
import pytest
import requests
from PIL import Image
import io

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://cr3-user-api:5000")
TEST_AUTH_TOKEN = os.getenv("TEST_AUTH_TOKEN")
ADMIN_AUTH_TOKEN = os.getenv("ADMIN_AUTH_TOKEN")
TEST_CRASH_ID = os.getenv("TEST_CRASH_ID", 13668443)
TEST_PERSON_ID = os.getenv("TEST_PERSON_ID", 102580)


@pytest.fixture
def api_base_url():
    """Base URL for the API"""
    return API_BASE_URL


@pytest.fixture
def headers():
    """Standard user auth headers"""
    if not TEST_AUTH_TOKEN:
        raise Exception("TEST_AUTH_TOKEN not set")
    return {"Authorization": TEST_AUTH_TOKEN}


@pytest.fixture
def admin_headers():
    """Admin user auth headers"""
    if not ADMIN_AUTH_TOKEN:
        raise Exception("ADMIN_AUTH_TOKEN not set")
    return {"Authorization": ADMIN_AUTH_TOKEN}


@pytest.fixture
def test_crash_id():
    """Test crash ID that should exist in S3"""
    return TEST_CRASH_ID


@pytest.fixture
def test_person_id():
    """Test person ID that should exist in database"""
    return TEST_PERSON_ID


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


@pytest.fixture
def create_test_image():
    """Factory fixture to create test images with custom dimensions and colors."""
    def _create_image(width=500, height=500, color="blue", format="JPEG"):
        img = Image.new("RGB", (width, height), color=color)
        buf = io.BytesIO()
        img.save(buf, format=format)
        buf.seek(0)
        buf.name = f"test.{format.lower()}"
        return buf
    return _create_image


@pytest.fixture
def cleanup_person_image(test_person_id, headers):
    """Delete person image after test."""
    yield
    try:
        url = f"{API_BASE_URL}/images/person/{test_person_id}"
        requests.delete(url, headers=headers)
    except:
        pass


@pytest.fixture
def cleanup_test_user(admin_headers):
    """Factory fixture to clean up test users by email after tests."""
    users_to_cleanup = []
    
    def _register_cleanup(email):
        """Register an email for cleanup"""
        users_to_cleanup.append(email)
    
    yield _register_cleanup
    
    # Cleanup all registered users
    for email in users_to_cleanup:
        try:
            list_res = requests.get(
                f"{API_BASE_URL}/user/list_users",
                headers=admin_headers,
                params={"page": 0, "per_page": 100}
            )
            if list_res.status_code == 200:
                users = list_res.json()["users"]
                for user in users:
                    if user.get("email") == email:
                        requests.delete(
                            f"{API_BASE_URL}/user/delete_user/{user['user_id']}",
                            headers=admin_headers
                        )
                        break
        except:
            pass
