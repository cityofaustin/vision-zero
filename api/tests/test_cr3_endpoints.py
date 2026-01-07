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

    def test_download_requires_auth(self, api_base_url, test_crash_id):
        """Test that download endpoint requires authentication"""
        res = requests.get(f"{api_base_url}/cr3/download/{test_crash_id}")
        assert res.status_code == 401

    def test_download_with_auth(self, api_base_url, headers, test_crash_id):
        """Test downloading a CR3 PDF with valid auth"""
        res = requests.get(
            f"{api_base_url}/cr3/download/{test_crash_id}", headers=headers
        )
        assert res.status_code == 200
        assert "message" in res.json()

        # Verify it's a presigned S3 URL
        url = res.json()["message"]
        assert "amazonaws.com" in url
        assert "Signature=" in url
        assert f"{test_crash_id}.pdf" in url

    def test_download_presigned_url_works(self, api_base_url, headers, test_crash_id):
        """Test that the presigned URL actually works"""
        res = requests.get(
            f"{api_base_url}/cr3/download/{test_crash_id}", headers=headers
        )
        assert res.status_code == 200

        presigned_url = res.json()["message"]

        # Try to download from S3
        s3_res = requests.get(presigned_url)
        # If the crash_id exists, we get 200, otherwise 403 or 404
        assert s3_res.status_code == 200

        # Verify it's a PDF (checks content type only)
        assert s3_res.headers.get("Content-Type") == "application/pdf"

    def test_download_invalid_crash_id_type(self, api_base_url, headers):
        """Test that non-integer crash IDs return 404"""
        res = requests.get(f"{api_base_url}/cr3/download/abc123", headers=headers)
        assert res.status_code == 404

    def test_download_nonexistent_crash_id(self, api_base_url, headers):
        """Test downloading with negative crash ID"""
        non_existent_crash_id = 1
        res = requests.get(
            f"{api_base_url}/cr3/download/{non_existent_crash_id}", headers=headers
        )

        assert res.status_code == 200
        presigned_url = res.json()["message"]

        # Try to download from S3
        s3_res = requests.get(presigned_url)
        assert s3_res.status_code == 404
