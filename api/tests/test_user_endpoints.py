"""Integration tests for user management endpoints"""

import os
import requests
import pytest
import time


class TestUserTest:
    """Tests for /user/test endpoint"""

    def test_user_test_requires_auth(self, api_base_url):
        """Test that user test endpoint requires authentication"""
        res = requests.get(f"{api_base_url}/user/test")
        assert res.status_code == 401

    def test_user_test_with_auth(self, api_base_url, headers):
        """Test user test endpoint returns current user info"""
        res = requests.get(f"{api_base_url}/user/test", headers=headers)
        assert res.status_code == 200
        assert "message" in res.json()

        # Should contain JWT payload data
        user_data = res.json()["message"]
        assert isinstance(user_data, dict)
        # Typical JWT claims
        assert "iss" in user_data or "sub" in user_data


class TestUserListUsers:
    """Tests for /user/list_users endpoint"""

    def test_list_users_requires_auth(self, api_base_url):
        """Test that list users requires authentication"""
        res = requests.get(f"{api_base_url}/user/list_users?page=0&per_page=10")
        assert res.status_code == 401

    def test_list_users_with_auth(self, api_base_url, headers):
        """Test listing users with pagination"""
        res = requests.get(
            f"{api_base_url}/user/list_users",
            headers=headers,
            params={"page": 0, "per_page": 10},
        )
        assert res.status_code == 200
        data = res.json()

        # Auth0 response structure
        assert "users" in data
        assert "start" in data
        assert "limit" in data
        assert "length" in data
        assert isinstance(data["users"], list)

    def test_list_users_pagination(self, api_base_url, headers):
        """Test pagination parameters work"""
        res = requests.get(
            f"{api_base_url}/user/list_users",
            headers=headers,
            params={"page": 1, "per_page": 5},
        )
        assert res.status_code == 200
        data = res.json()
        assert len(data["users"]) <= 5


class TestUserGetUser:
    """Tests for /user/get_user/<id> endpoint"""

    def test_get_user_requires_auth(self, api_base_url):
        """Test that get user requires authentication"""
        res = requests.get(f"{api_base_url}/user/get_user/auth0|123456")
        assert res.status_code == 401

    def test_get_user_with_auth(self, api_base_url, headers):
        """Test getting a specific user"""
        # First get the list to find a valid user ID
        list_res = requests.get(
            f"{api_base_url}/user/list_users",
            headers=headers,
            params={"page": 0, "per_page": 1},
        )
        assert list_res.status_code == 200

        users = list_res.json()["users"]
        if len(users) > 0:
            user_id = users[0]["user_id"]

            # Get that specific user
            res = requests.get(
                f"{api_base_url}/user/get_user/{user_id}", headers=headers
            )
            assert res.status_code == 200

            user_data = res.json()
            assert "user_id" in user_data
            assert user_data["user_id"] == user_id

    def test_get_nonexistent_user(self, api_base_url, headers):
        """Test getting a user that doesn't exist"""
        fake_id = "auth0|nonexistent123456789"
        res = requests.get(f"{api_base_url}/user/get_user/{fake_id}", headers=headers)
        # Auth0 returns 404 for non-existent users
        assert res.status_code == 404


class TestUserCreateUser:
    """Tests for /user/create_user endpoint"""

    @pytest.fixture
    def test_user_email(self):
        """Generate unique email for test user"""
        timestamp = int(time.time())
        return f"test_user_{timestamp}@austinmobility.io"

    @pytest.fixture(autouse=True)
    def cleanup_test_user(self, api_base_url, admin_headers, test_user_email):
        """Clean up test user after each test"""
        yield

        # Try to find and delete the test user
        try:
            list_res = requests.get(
                f"{api_base_url}/user/list_users",
                headers=admin_headers,
                params={"page": 0, "per_page": 100},
            )
            if list_res.status_code == 200:
                users = list_res.json()["users"]
                for user in users:
                    if user.get("email") == test_user_email:
                        requests.delete(
                            f"{api_base_url}/user/delete_user/{user['user_id']}",
                            headers=admin_headers,
                        )
                        break
        except:
            pass

    def test_create_user_requires_auth(self, api_base_url, test_user_email):
        """Test that create user requires authentication"""
        res = requests.post(
            f"{api_base_url}/user/create_user", json={"email": test_user_email}
        )
        assert res.status_code == 401

    def test_create_user_requires_admin(self, api_base_url, headers, test_user_email):
        """Test that create user requires admin role"""
        res = requests.post(
            f"{api_base_url}/user/create_user",
            headers=headers,
            json={"email": test_user_email},
        )
        assert res.status_code == 403
        assert "You do not have permission" in res.json()["message"]

    def test_create_user_with_admin(self, api_base_url, admin_headers, test_user_email):
        """Test creating a user with admin privileges"""
        res = requests.post(
            f"{api_base_url}/user/create_user",
            headers=admin_headers,
            json={
                "name": "Test User",
                "email": test_user_email,
                "app_metadata": {"roles": ["readonly"]},
            },
        )
        assert res.status_code == 201

        user_data = res.json()
        assert user_data["email"] == test_user_email
        assert "user_id" in user_data
        assert user_data["email_verified"] is False

    def test_create_user_duplicate_email(
        self, api_base_url, admin_headers, test_user_email
    ):
        """Test creating a user with duplicate email fails"""
        # Create first user
        res1 = requests.post(
            f"{api_base_url}/user/create_user",
            headers=admin_headers,
            json={
                "name": "Test User",
                "email": test_user_email,
                "app_metadata": {"roles": ["readonly"]},
            },
        )
        assert res1.status_code == 201

        # Try to create duplicate
        res2 = requests.post(
            f"{api_base_url}/user/create_user",
            headers=admin_headers,
            json={
                "name": "Test User",
                "email": test_user_email,
                "app_metadata": {"roles": ["readonly"]},
            },
        )
        # Auth0 returns 409 for duplicate emails
        assert res2.status_code == 409


class TestUserUpdateUser:
    """Tests for /user/update_user/<id> endpoint"""

    def test_update_user_requires_auth(self, api_base_url):
        """Test that update user requires authentication"""
        res = requests.put(
            f"{api_base_url}/user/update_user/auth0|123456", json={"name": "New Name"}
        )
        assert res.status_code == 401

    # todo: add app_metadata.roles here and test chaning them
    def test_update_user_requires_admin(self, api_base_url, headers):
        """Test that update user requires admin role"""
        res = requests.put(
            f"{api_base_url}/user/update_user/auth0|123456",
            headers=headers,
            json={"name": "New Name"},
        )
        assert res.status_code == 403

    def test_update_user_with_admin(self, api_base_url, admin_headers):
        """Test updating a user with admin privileges"""
        # First get a user to update
        list_res = requests.get(
            f"{api_base_url}/user/list_users",
            headers=admin_headers,
            params={"page": 0, "per_page": 1},
        )
        assert list_res.status_code == 200

        users = list_res.json()["users"]
        if len(users) > 0:
            user_id = users[0]["user_id"]
            original_name = users[0].get("name", "")

            # Update the user
            new_name = f"Updated Name {int(time.time())}"
            res = requests.put(
                f"{api_base_url}/user/update_user/{user_id}",
                headers=admin_headers,
                json={"name": new_name},
            )
            assert res.status_code == 200

            updated_user = res.json()
            assert updated_user["name"] == new_name

            # Restore original name
            requests.put(
                f"{api_base_url}/user/update_user/{user_id}",
                headers=admin_headers,
                json={"name": original_name},
            )


class TestUserUnblockUser:
    """Tests for /user/unblock_user/<id> endpoint"""

    def test_unblock_user_requires_auth(self, api_base_url):
        """Test that unblock user requires authentication"""
        res = requests.delete(f"{api_base_url}/user/unblock_user/auth0|123456")
        assert res.status_code == 401

    def test_unblock_user_requires_admin(self, api_base_url, headers):
        """Test that unblock user requires admin role"""
        res = requests.delete(
            f"{api_base_url}/user/unblock_user/auth0|123456", headers=headers
        )
        assert res.status_code == 403

    def test_unblock_user_with_admin(self, api_base_url, admin_headers):
        """Test unblocking a user with admin privileges"""
        # This will likely return 404 if user isn't blocked, which is fine
        res = requests.delete(
            f"{api_base_url}/user/unblock_user/auth0|nonexistent", headers=admin_headers
        )
        assert res.status_code in [200, 404]


class TestUserDeleteUser:
    """Tests for /user/delete_user/<id> endpoint"""

    def test_delete_user_requires_auth(self, api_base_url):
        """Test that delete user requires authentication"""
        res = requests.delete(f"{api_base_url}/user/delete_user/auth0|123456")
        assert res.status_code == 401

    def test_delete_user_requires_admin(self, api_base_url, headers):
        """Test that delete user requires admin role"""
        res = requests.delete(
            f"{api_base_url}/user/delete_user/auth0|123456", headers=headers
        )
        assert res.status_code == 403

    def test_delete_user_with_admin(self, api_base_url, admin_headers):
        """Test deleting a user with admin privileges"""
        # Create a user to delete
        timestamp = int(time.time())
        test_email = f"delete_test_{timestamp}@example.com"

        create_res = requests.post(
            f"{api_base_url}/user/create_user",
            headers=admin_headers,
            json={"email": test_email},
        )
        assert create_res.status_code == 201

        user_id = create_res.json()["user_id"]

        # Delete the user
        delete_res = requests.delete(
            f"{api_base_url}/user/delete_user/{user_id}", headers=admin_headers
        )
        assert delete_res.status_code == 204

    def test_delete_nonexistent_user(self, api_base_url, admin_headers):
        """Test deleting a user that doesn't exist"""
        fake_id = "auth0|nonexistent123456789"
        res = requests.delete(
            f"{api_base_url}/user/delete_user/{fake_id}", headers=admin_headers
        )
        assert res.status_code == 404
