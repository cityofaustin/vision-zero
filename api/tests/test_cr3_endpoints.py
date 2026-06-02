"""Integration tests for CR3 endpoints"""

import requests


class TestHealthcheck:
    """Tests for the healthcheck endpoint"""

    def test_healthcheck_no_auth(self, api_base_url):
        """Test healthcheck works without authentication"""
        res = requests.get(f"{api_base_url}/")
        assert res.status_code == 200
        assert "message" in res.json()
        assert "CR3 Download API - Health Check" in res.json()["message"]
        assert "System Uptime" in res.json()["message"]
        assert "Process Uptime" in res.json()["message"]


class TestCR3Download:
    """Tests for CR3 PDF download endpoint"""

    def test_download_requires_auth(self, api_base_url, test_crash_record_locator):
        """Test that download endpoint requires authentication"""
        res = requests.get(f"{api_base_url}/cr3/download/{test_crash_record_locator}")
        assert res.status_code == 401

    def test_download_with_auth(
        self, api_base_url, editor_user_headers, test_crash_record_locator
    ):
        """Test downloading a CR3 PDF with valid auth"""
        res = requests.get(
            f"{api_base_url}/cr3/download/{test_crash_record_locator}",
            headers=editor_user_headers,
        )
        assert res.status_code == 200
        assert "message" in res.json()

        # Verify it's a presigned S3 URL
        presigned_url = res.json()["message"]
        assert "amazonaws.com" in presigned_url
        assert "Signature=" in presigned_url
        assert f"{test_crash_record_locator}.pdf" in presigned_url

        # Download and verify content type from S3
        s3_res = requests.get(presigned_url)
        assert s3_res.status_code == 200
        assert s3_res.headers.get("Content-Type") == "application/pdf"

    def test_download_nonexistent_crash_id(self, api_base_url, editor_user_headers):
        """Test downloading with negative crash ID"""
        non_existent_crash_id = 1
        res = requests.get(
            f"{api_base_url}/cr3/download/{non_existent_crash_id}",
            headers=editor_user_headers,
        )

        assert res.status_code == 200
        presigned_url = res.json()["message"]

        # Try to download from S3
        s3_res = requests.get(presigned_url)
        assert s3_res.status_code == 404
