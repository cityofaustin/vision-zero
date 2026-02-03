#!/usr/bin/env python
"""
API which handles
- Auth0 user management
- CR3 PDF downloads
- Person image uploads and downloads
"""
import datetime
import json
from os import getenv, getpid, sysconf_names, sysconf
import re
import secrets
import string

import boto3
from dotenv import load_dotenv, find_dotenv
from flask import Flask, request, jsonify, g
from flask_cors import cross_origin
from functools import wraps
from jose import jwt
from werkzeug.exceptions import HTTPException

import requests
from six.moves.urllib.request import urlopen
from werkzeug.local import LocalProxy


from utils.images import (
    _upsert_person_image,
    _delete_person_image,
    _get_person_image_url,
    validate_file_size,
)


ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE, verbose=True)

AUTH0_DOMAIN = getenv("AUTH0_DOMAIN", "")
CLIENT_ID = getenv("CLIENT_ID", "")
API_CLIENT_ID = getenv("API_CLIENT_ID", "")
API_CLIENT_SECRET = getenv("API_CLIENT_SECRET", "")
AWS_DEFAULT_REGION = getenv("AWS_DEFAULT_REGION", "us-east-1")
AWS_S3_KEY = getenv("AWS_S3_KEY", "")
AWS_S3_SECRET = getenv("AWS_S3_SECRET", "")
AWS_S3_BUCKET_ENV = getenv("AWS_S3_BUCKET_ENV", "")
AWS_S3_CR3_LOCATION = f"{AWS_S3_BUCKET_ENV}/cr3s/pdfs"
AWS_S3_PERSON_IMAGE_LOCATION = f"{AWS_S3_BUCKET_ENV}/images/person"
AWS_S3_BUCKET = getenv("AWS_S3_BUCKET", "")

ADMIN_ROLE_NAME = "vz-admin"
EDITOR_ROLE_NAME = "editor"
MAX_IMAGE_SIZE_MEGABYTES = 5
CORS_URL = "*"

app = Flask(__name__)

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
@app.after_request
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


# These custom error handlers enable us to return JSON-ified error messages
@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


@app.errorhandler(HTTPException)
def handle_http_exception(error):
    """Handle exceptions raised via flask.abort()
    Usage:
        from flask import abort
        abort(400, description="Email is required")
    """
    return jsonify({"error": error.description, "status": error.code}), error.code


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
                    algorithms=["RS256"],
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
            except Exception:
                raise AuthError(
                    {
                        "code": "invalid_header",
                        "description": f"Unable to parse authentication token.",
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


def requires_roles(*allowed_roles):
    """
    Restrict route access to specific roles.

    Usage:
        @requires_roles('vz-admin', 'editor')
    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            claims = current_user.get("https://hasura.io/jwt/claims", False)

            if not claims:
                return notAuthorizedError()

            user_roles = claims.get("x-hasura-allowed-roles", [])

            # Check if user has any of the allowed roles
            if not any(role in user_roles for role in allowed_roles):
                return notAuthorizedError()
            return f(*args, **kwargs)

        return decorated_function

    return decorator


current_user = LocalProxy(lambda: getattr(g, "current_user", None))


@app.route("/")
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
    pid = getpid()
    with open(f"/proc/{pid}/stat", "r") as f:
        proc_start_time_ticks = int(f.readline().split()[21])
        proc_start_time_seconds = proc_start_time_ticks / sysconf(
            sysconf_names["SC_CLK_TCK"]
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


@app.route("/cr3/download/<int:crash_id>")
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
    url = s3.generate_presigned_url(
        ExpiresIn=60,  # seconds
        ClientMethod="get_object",
        Params={
            "Bucket": AWS_S3_BUCKET,
            "Key": AWS_S3_CR3_LOCATION + "/" + str(crash_id) + ".pdf",
        },
    )

    # For testing uncomment:
    # response = "Private Download, CrashID: %s , %s" % (safe_crash_id, url)
    # return redirect(url, code=302)
    return jsonify(message=url)


@app.route("/images/person/<int:person_id>", methods=["DELETE", "PUT"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
@requires_roles(ADMIN_ROLE_NAME, EDITOR_ROLE_NAME)
@validate_file_size(MAX_IMAGE_SIZE_MEGABYTES)
def person_image(person_id):
    """Upserts or deletes a person image"""
    if request.method == "PUT":
        return _upsert_person_image(person_id, s3)

    elif request.method == "DELETE":
        return _delete_person_image(person_id, s3)

    return jsonify(message="Bad Request"), 400


@app.route("/images/person/<int:person_id>", methods=["GET"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
@validate_file_size(MAX_IMAGE_SIZE_MEGABYTES)
def person_image(person_id):
    """Retrieves a person image"""
    return _get_person_image_url(person_id, s3)


@app.route("/user/test")
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
    return jsonify(message=dict(current_user))


@app.route("/user/list_users")
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


@app.route("/user/get_user/<id>")
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


@app.route("/user/create_user", methods=["POST"])
@cross_origin(headers=["Content-Type", "Authorization"])
@cross_origin(headers=["Access-Control-Allow-Origin", CORS_URL])
@requires_auth
@requires_roles(ADMIN_ROLE_NAME)
def user_create_user():

    json_data = request.json

    # validate our custom user metadata
    app_metadata = json_data.get("app_metadata")
    if not app_metadata or type(app_metadata) != dict:
        return jsonify(error="Invalid app_metadata"), 400

    roles = app_metadata.get("roles")
    if not roles or type(roles) != list or len(roles) != 1:
        return jsonify(error="Invalid app_metadata.roles"), 400

    if roles[0] not in ["readonly", "editor", "vz-admin"]:
        return (
            jsonify(error="Role must be one of 'readonly', 'editor', or 'vz-admin'"),
            400,
        )

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


@app.route("/user/update_user/<id>", methods=["PUT"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
@requires_roles(ADMIN_ROLE_NAME)
def user_update_user(id):
    json_data = request.json
    endpoint = f"https://{AUTH0_DOMAIN}/api/v2/users/" + id
    headers = {"Authorization": f"Bearer {get_api_token()}"}
    response = requests.patch(endpoint, headers=headers, json=json_data)
    return jsonify(response.json()), response.status_code


@app.route("/user/unblock_user/<id>", methods=["DELETE"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
@requires_roles(ADMIN_ROLE_NAME)
def user_unblock_user(id):
    endpoint = f"https://{AUTH0_DOMAIN}/api/v2/user_blocks/" + id
    headers = {"Authorization": f"Bearer {get_api_token()}"}
    response = requests.delete(endpoint, headers=headers)
    return jsonify(response.json()), response.status_code


@app.route("/user/delete_user/<id>", methods=["DELETE"])
@cross_origin(
    headers=[
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Origin",
        CORS_URL,
    ],
)
@requires_auth
@requires_roles(ADMIN_ROLE_NAME)
def user_delete_user(id):
    endpoint = f"https://{AUTH0_DOMAIN}/api/v2/users/" + id
    headers = {"Authorization": f"Bearer {get_api_token()}"}
    response = requests.delete(endpoint, headers=headers)
    if response.headers.get("Content-Type") == "application/json":
        return jsonify(response.json()), response.status_code
    else:
        return response.text, response.status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=getenv("PORT", 3010), debug=AWS_S3_BUCKET_ENV == "dev")
