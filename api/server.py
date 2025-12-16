#!/usr/bin/env python
#
# ATD - CR3 Download API
#

import datetime
import json
import os
import re
import secrets
import string
import sys

import boto3
import requests

from dotenv import load_dotenv, find_dotenv
from os import environ as env
from functools import wraps
from six.moves.urllib.request import urlopen

from flask import Flask, request, jsonify, g
from flask_cors import cross_origin
from werkzeug.local import LocalProxy
from jose import jwt

#
# Environment
#
ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE, verbose=True)

# We need the Auth0 domain, Client ID and current api environment.
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "")
CLIENT_ID = os.getenv("CLIENT_ID", "")
API_CLIENT_ID = os.getenv("API_CLIENT_ID", "")
API_CLIENT_SECRET = os.getenv("API_CLIENT_SECRET", "")

# AWS Configuration
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
AWS_S3_KEY = os.getenv("AWS_S3_KEY", "")
AWS_S3_SECRET = os.getenv("AWS_S3_SECRET", "")
# todo: new env var
AWS_S3_BUCKET_ENV = "local"
AWS_S3_CR3_LOCATION = f"/{AWS_S3_BUCKET_ENV}/cr3s/pdfs"
AWS_S3_PERSON_IMAGE_LOCATION = f"/{AWS_S3_BUCKET_ENV}/images/person"
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "")

ADMIN_ROLE_NAME = "vz-admin"

CORS_URL = "*"
ALGORITHMS = ["RS256"]
APP = Flask(__name__)


s3 = boto3.client(
    "s3",
    region_name=AWS_DEFAULT_REGION,
    aws_access_key_id=AWS_S3_KEY,
    aws_secret_access_key=AWS_S3_SECRET,
)


def get_secure_password(num_chars=16):
    """Generate a secure random password with at least one lowercase character,
    uppercase character, special character, and digit:
    https://docs.python.org/3/library/secrets.html#recipes-and-best-practices

    Args:
        num_chars (int, optional): Defaults to 16.
    """
    special_chars = "!@#$%^&*"
    alphabet = string.ascii_letters + string.digits + special_chars
    while True:
        password = "".join(secrets.choice(alphabet) for i in range(num_chars))
        if (
            any(c.islower() for c in password)
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
            and any(c in special_chars for c in password)
        ):
            break
    return password


def get_api_token():
    """
    Obtains a token from the Auth0 API
    :return str:
    """
    response = requests.post(
        f"https://{AUTH0_DOMAIN}/oauth/token",
        {
            "grant_type": "client_credentials",
            "client_id": API_CLIENT_ID,
            "client_secret": API_CLIENT_SECRET,
            "audience": f"https://{AUTH0_DOMAIN}/api/v2/",
        },
        {
            "content-type": "application/json",
        },
    )
    return response.json().get("access_token", None)


def notAuthorizedError():
    """Return 403 error as application/json in shape of the Auth0 API"""
    return (
        jsonify(
            {
                "error": "Forbidden",
                "message": "You do not have permission to access this resource.",
                "statusCode": 403,
            }
        ),
        403,
    )


# Add the appropriate security headers to all responses
# These headers may be overwritten in prod and staging by the API gateway!
@APP.after_request
def add_custom_headers(response):
    # Cache-Control to manage caching behavior
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"

    # Content-Security-Policy to prevent XSS and other attacks
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; object-src 'none'"
    )

    # Strict-Transport-Security to enforce HTTPS
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains; preload"
    )

    # X-Content-Type-Options to prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"

    # X-Frame-Options to prevent clickjacking
    response.headers["X-Frame-Options"] = "SAMEORIGIN"

    # Referrer-Policy to control referrer information
    response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"

    # Permissions-Policy to restrict browser feature access
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    # X-XSS-Protection to prevent reflected XSS attacks (deprecated in modern browsers)
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # Expect-CT to enforce Certificate Transparency
    response.headers["Expect-CT"] = "max-age=86400, enforce"

    # Access-Control-Allow-Origin for CORS
    # These headers may be overwritten in prod and staging by the API gateway!
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, DELETE, POST, PUT, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"

    return response


# Format error response and append status code.
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code


@APP.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


def get_token_auth_header():
    """Obtains the access token from the Authorization Header"""
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise AuthError(
            {
                "code": "authorization_header_missing",
                "description": "Authorization header is expected",
            },
            401,
        )

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must start with" " Bearer",
            },
            401,
        )
    elif len(parts) == 1:
        raise AuthError(
            {"code": "invalid_header", "description": "Token not found"}, 401
        )
    elif len(parts) > 2:
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must be" " Bearer token",
            },
            401,
        )

    token = parts[1]
    return token


def requires_auth(f):
    """Determines if the access token is valid"""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        jsonurl = urlopen("https://" + AUTH0_DOMAIN + "/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())

        try:
            unverified_header = jwt.get_unverified_header(token)
        except jwt.JWTError:
            raise AuthError(
                {
                    "code": "invalid_header",
                    "description": "Invalid header. "
                    "Use an RS256 signed JWT Access Token",
                },
                401,
            )
        if unverified_header["alg"] == "HS256":
            raise AuthError(
                {
                    "code": "invalid_header",
                    "description": "Invalid header. "
                    "Use an RS256 signed JWT Access Token",
                },
                401,
            )
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
        if rsa_key:
            dataConfig = {
                "verify_signature": True,
                "verify_aud": True,
                "verify_iat": True,
                "verify_exp": True,
                "verify_nbf": False,
                "verify_iss": True,
                "verify_sub": True,
                "verify_jti": False,
                "verify_at_hash": False,
                "leeway": 0,
            }
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=ALGORITHMS,
                    issuer="https://" + AUTH0_DOMAIN + "/",
                    audience=CLIENT_ID,
                    options=dataConfig,
                )
            except jwt.ExpiredSignatureError:
                raise AuthError(
                    {"code": "token_expired", "description": "token is expired"}, 401
                )
            except jwt.JWTClaimsError as e:
                raise AuthError(
                    {
                        "code": "invalid_claims",
                        "description": "incorrect claims, please check the audience and issuer",
                    },
                    401,
                )
            except Exception as e:
                raise AuthError(
                    {
                        "code": "invalid_header",
                        "description": f"{e}: Unable to parse authentication token.",
                    },
                    401,
                )
            g.current_user = payload

            return f(*args, **kwargs)
        raise AuthError(
            {"code": "invalid_header", "description": "Unable to find appropriate key"},
            401,
        )

    return decorated


current_user = LocalProxy(lambda: getattr(g, "current_user", None))


# Controllers API


@APP.route("/")
@cross_origin(headers=["Content-Type", "Authorization"])
def healthcheck():
    """No access token required to access this route"""
    now = datetime.datetime.now()

    # Read the system uptime from /proc/uptime
    with open("/proc/uptime", "r") as f:
        uptime_seconds = float(f.readline().split()[0])
        uptime_str = str(datetime.timedelta(seconds=uptime_seconds)).split(".")[
            0
        ]  # Remove microseconds for a terse format

    # Get the process start time
    pid = os.getpid()
    with open(f"/proc/{pid}/stat", "r") as f:
        proc_start_time_ticks = int(f.readline().split()[21])
        proc_start_time_seconds = proc_start_time_ticks / os.sysconf(
            os.sysconf_names["SC_CLK_TCK"]
        )
        proc_uptime_seconds = uptime_seconds - proc_start_time_seconds
        proc_uptime_str = str(datetime.timedelta(seconds=proc_uptime_seconds)).split(
            "."
        )[
            0
        ]  # Remove microseconds for a terse format

    response = (
        "CR3 Download API - Health Check - Available @ %s - System Uptime: %s - Process Uptime: %s"
        % (
            now.strftime("%Y-%m-%d %H:%M:%S"),
            uptime_str,
            proc_uptime_str,
        )
    )
    return jsonify(message=response)


@APP.route("/cr3/download/<crash_id>")
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
def download_crash_id(crash_id):
    """A valid access token is required to access this route"""
    # We only care for an integer string, anything else is not safe:
    safe_crash_id = re.sub("[^0-9]", "", crash_id)

    url = s3.generate_presigned_url(
        ExpiresIn=60,  # seconds
        ClientMethod="get_object",
        Params={
            "Bucket": AWS_S3_BUCKET,
            "Key": AWS_S3_CR3_LOCATION + "/" + safe_crash_id + ".pdf",
        },
    )

    # For testing uncomment:
    # response = "Private Download, CrashID: %s , %s" % (safe_crash_id, url)
    # return redirect(url, code=302)
    return jsonify(message=url)


@APP.route("/images/person/<person_id>", methods=["GET", "POST"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
def person_image(person_id):
    """GET: retrieve image URL, POST: upload image"""
    safe_person_id = re.sub("[^0-9]", "", person_id)

    if request.method == "GET":
        url = s3.generate_presigned_url(
            ExpiresIn=3600,
            ClientMethod="get_object",
            Params={
                "Bucket": AWS_S3_BUCKET,
                "Key": f"{AWS_S3_PERSON_IMAGE_LOCATION}/{safe_person_id}.jpg",
            },
        )
        return jsonify(url=url)

    elif request.method == "POST":
        # Check if image file is in request
        if "file" not in request.files:
            return jsonify(error="No file provided"), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify(error="No file selected"), 400

        # Validate file type
        allowed_extensions = {"jpg", "jpeg", "png"}
        ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else ""

        if ext not in allowed_extensions:
            return jsonify(error="Invalid file type"), 400

        # Upload to S3
        try:
            s3.upload_fileobj(
                file,
                AWS_S3_BUCKET,
                f"{AWS_S3_PERSON_IMAGE_LOCATION}/{safe_person_id}.jpg",
                ExtraArgs={
                    "ContentType": file.content_type or "image/jpeg",
                    "ACL": "private",  # Keep it private
                },
            )
            return jsonify(message="Image uploaded successfully"), 201

        except Exception as e:
            return jsonify(error=f"Upload failed: {str(e)}"), 500


def hasUserRole(role, user_dict):
    claims = user_dict.get("https://hasura.io/jwt/claims", False)
    if claims != False:
        roles = claims.get("x-hasura-allowed-roles")
        if role in roles:
            return True
    return False


@APP.route("/user/test")
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
def user_test():
    return jsonify(message=current_user._get_current_object())


@APP.route("/user/list_users")
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
def user_list_users():
    page = request.args.get("page")
    per_page = request.args.get("per_page")
    endpoint = (
        f"https://{AUTH0_DOMAIN}/api/v2/users?page="
        + page
        + "&per_page="
        + per_page
        + "&include_totals=true&sort=last_login:-1"
    )
    headers = {"Authorization": f"Bearer {get_api_token()}"}
    response = requests.get(endpoint, headers=headers)
    return jsonify(response.json()), response.status_code


@APP.route("/user/get_user/<id>")
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
def user_get_user(id):
    endpoint = f"https://{AUTH0_DOMAIN}/api/v2/users/" + id
    headers = {"Authorization": f"Bearer {get_api_token()}"}
    response = requests.get(endpoint, headers=headers)
    return jsonify(response.json()), response.status_code


@APP.route("/user/create_user", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@cross_origin(headers=["Access-Control-Allow-Origin", CORS_URL])
@requires_auth
def user_create_user():
    user_dict = current_user._get_current_object()
    if hasUserRole(ADMIN_ROLE_NAME, user_dict):
        json_data = request.json
        # set the user's password - user will have to reset it for access
        json_data["password"] = get_secure_password()
        # set additional user properties
        json_data["connection"] = "Username-Password-Authentication"
        json_data["verify_email"] = True
        json_data["email_verified"] = False
        endpoint = f"https://{AUTH0_DOMAIN}/api/v2/users"
        headers = {"Authorization": f"Bearer {get_api_token()}"}
        response = requests.post(endpoint, headers=headers, json=json_data)
        return jsonify(response.json()), response.status_code
    else:
        return notAuthorizedError()


@APP.route("/user/update_user/<id>", methods=["PUT"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
def user_update_user(id):
    user_dict = current_user._get_current_object()
    if hasUserRole(ADMIN_ROLE_NAME, user_dict):
        json_data = request.json
        endpoint = f"https://{AUTH0_DOMAIN}/api/v2/users/" + id
        headers = {"Authorization": f"Bearer {get_api_token()}"}
        response = requests.patch(endpoint, headers=headers, json=json_data)
        return jsonify(response.json()), response.status_code
    else:
        return notAuthorizedError()


@APP.route("/user/unblock_user/<id>", methods=["DELETE"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
def user_unblock_user(id):
    user_dict = current_user._get_current_object()
    if hasUserRole(ADMIN_ROLE_NAME, user_dict):
        endpoint = f"https://{AUTH0_DOMAIN}/api/v2/user_blocks/" + id
        headers = {"Authorization": f"Bearer {get_api_token()}"}
        response = requests.delete(endpoint, headers=headers)
        return f"{response.status_code}"
    else:
        return notAuthorizedError()


@APP.route("/user/delete_user/<id>", methods=["DELETE"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
def user_delete_user(id):
    user_dict = current_user._get_current_object()
    if hasUserRole(ADMIN_ROLE_NAME, user_dict):
        endpoint = f"https://{AUTH0_DOMAIN}/api/v2/users/" + id
        headers = {"Authorization": f"Bearer {get_api_token()}"}
        response = requests.delete(endpoint, headers=headers)
        if response.headers.get("Content-Type") == "application/json":
            return jsonify(response.json()), response.status_code
        else:
            return response.text, response.status_code
    else:
        return notAuthorizedError()


if __name__ == "__main__":
    APP.run(host="0.0.0.0", port=env.get("PORT", 3010))
