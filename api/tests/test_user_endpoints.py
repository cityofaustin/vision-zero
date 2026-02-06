"""Integration tests for user management endpoints"""

import pytest
import requests
import time


class TestUserAuth:
    """Test authentication and authorization"""

    def test_endpoints_require_auth(self, api_base_url):
        """All endpoints require authentication"""
        endpoints = [
            ("GET", "/user/test"),
            ("GET", "/user/list_users?page=0&per_page=10"),
            ("POST", "/user/create_user"),
        ]
        for method, path in endpoints:
            res = requests.request(method, f"{api_base_url}{path}")
            assert res.status_code == 401

    def test_admin_endpoints_require_admin_role(
        self, api_base_url, editor_user_headers
    ):
        """Admin-only endpoints reject non-admin users"""
        res = requests.post(
            f"{api_base_url}/user/create_user",
            headers=editor_user_headers,
            json={"email": "test@test.com", "app_metadata": {"roles": ["readonly"]}},
        )
        assert res.status_code == 403


class TestUserCRUD:
    """Test user CRUD operations"""

    def test_full_user_lifecycle(
        self,
        api_base_url,  # Fixture: provides the base API URL
        admin_user_headers,  # Fixture: provides authentication headers
        cleanup_test_user,  # Fixture: cleanup function to ensure created user is deleted on teardown
    ):
        """Create -> read -> update -> delete -> verify"""
        timestamp = int(time.time())
        email = f"dts_test_user_{timestamp}@austintexas.gov"

        # Create a user
        res = requests.post(
            f"{api_base_url}/user/create_user",
            headers=admin_user_headers,
            json={
                "name": "Test",
                "email": email,
                "app_metadata": {"roles": ["readonly"]},
            },
        )
        assert res.status_code == 201
        user_id = res.json()["user_id"]

        # register this user ID for cleanup during teardown
        cleanup_test_user(user_id)

        # Read
        res = requests.get(
            f"{api_base_url}/user/get_user/{user_id}", headers=admin_user_headers
        )
        assert res.status_code == 200
        assert res.json()["email"] == email

        # Update
        res = requests.put(
            f"{api_base_url}/user/update_user/{user_id}",
            headers=admin_user_headers,
            json={"name": "Updated"},
        )
        assert res.status_code == 200
        assert res.json()["name"] == "Updated"

        # Delete
        res = requests.delete(
            f"{api_base_url}/user/delete_user/{user_id}", headers=admin_user_headers
        )
        assert res.status_code == 204

        # Verify deleted
        res = requests.get(
            f"{api_base_url}/user/get_user/{user_id}", headers=admin_user_headers
        )
        assert res.status_code == 404

    def test_list_users_with_pagination(self, api_base_url, editor_user_headers):
        """List users returns paginated results"""
        res = requests.get(
            f"{api_base_url}/user/list_users",
            headers=editor_user_headers,
            params={"page": 0, "per_page": 5},
        )
        assert res.status_code == 200
        assert "users" in res.json()
        assert len(res.json()["users"]) <= 5


class TestUserValidation:
    """Test input validation for user creation and updates"""

    # @pytest.mark.parametrize runs this test multiple times with different inputs
    # Think of it as a "for loop" that creates 3 separate test cases from one function
    # Each tuple in the list becomes (payload, error_msg) for one test run
    @pytest.mark.parametrize(
        "payload,error_msg",
        [
            # Test case 1: Missing app_metadata entirely
            ({"email": ""}, "Invalid app_metadata"),
            # Test case 2: Empty roles array
            (
                {"email": "", "app_metadata": {"roles": []}},
                "Invalid app_metadata.roles",
            ),
            # Test case 3: Invalid role name
            (
                {"email": "", "app_metadata": {"roles": ["bad"]}},
                "must be one of",
            ),
        ],
    )
    def test_create_user_validation_errors(
        self,
        api_base_url,  # Fixture: provides the base API URL
        admin_user_headers,  # Fixture: provides authentication headers
        payload,  # Parametrized: the JSON data to send (changes each run)
        error_msg,  # Parametrized: the expected error message (changes each run)
    ):
        """Verify that invalid user data returns 400 status with appropriate error messages"""
        payload["email"] = f"dts_test_user@austintexas.gov"
        res = requests.post(
            f"{api_base_url}/user/create_user",
            headers=admin_user_headers,
            json=payload,
        )
        assert res.status_code == 400
        assert error_msg in res.json()["error"]

    def test_duplicate_email_rejected(
        self,
        api_base_url,  # Fixture: provides the base API URL
        admin_user_headers,  # Fixture: provides authentication headers
        cleanup_test_user,  # Fixture: provides a function to register users for cleanup
    ):
        """Verify that creating two users with the same email returns 409 Conflict"""
        # Generate unique email to avoid conflicts with other test runs
        timestamp = int(time.time())
        email = f"dts_test_user_{timestamp}@austintexas.gov"
        payload = {"email": email, "app_metadata": {"roles": ["readonly"]}}

        # First creation should succeed
        res1 = requests.post(
            f"{api_base_url}/user/create_user", headers=admin_user_headers, json=payload
        )
        assert res1.status_code == 201
        user_id = res1.json()["user_id"]

        # Register for cleanup AFTER successful creation
        # This SCHEDULES deletion for after the test (in the fixture's teardown phase)
        cleanup_test_user(user_id)

        # Second creation with same email should fail with 409 Conflict
        res2 = requests.post(
            f"{api_base_url}/user/create_user", headers=admin_user_headers, json=payload
        )
        assert res2.status_code == 409
