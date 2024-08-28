import argparse
import os
import time

import requests


AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
ADMIN_USER_EMAIL = os.getenv("ADMIN_USER_EMAIL")


def get_cli_args():
    parser = argparse.ArgumentParser(
        description="Bulk update Auth0 users",
        usage="update_users.py block --no-dry-run",
    )
    parser.add_argument(
        "--no-dry-run",
        action="store_true",
        help="Actually update users",
    )
    parser.add_argument(
        "mode",
        choices=["block", "unblock"],
        help='The action to take: "block" or "unblock"',
    )
    return parser.parse_args()


def get_management_api_token():
    url = f"https://{AUTH0_DOMAIN}/oauth/token"
    headers = {"Content-Type": "application/json"}
    payload = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "audience": f"https://{AUTH0_DOMAIN}/api/v2/",
    }

    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()

    data = response.json()
    return data["access_token"]


def get_all_user_ids(token):
    users = []
    url = f"https://{AUTH0_DOMAIN}/api/v2/users"
    headers = {"Authorization": f"Bearer {token}"}

    params = {"per_page": 50, "page": 0}  # Adjust as needed

    while True:
        print(f"Getting 50 users...")
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        page_of_users = response.json()

        if not page_of_users:
            break

        users.extend(page_of_users)
        params["page"] += 1

    return users


def update_user_status(blocked, dry_run):
    token = get_management_api_token()
    users = get_all_user_ids(token)
    url = f"https://{AUTH0_DOMAIN}/api/v2/users"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    for user in users:
        if user["email"] == ADMIN_USER_EMAIL:
            continue

        if blocked and user.get("blocked"):
            print(f"WARNING: user already blocked: {user['email']}")
            continue

        elif not blocked and not user.get("blocked"):
            print(f"WARNING: user already unblocked: {user['email']}")
            continue

        user_id = user["user_id"]
        if not dry_run:
            response = requests.patch(
                f"{url}/{user_id}", json={"blocked": blocked}, headers=headers
            )
            try:
                response.raise_for_status()
            except requests.exceptions.HTTPError:
                # the token has probably expired
                if response.status_code == 401:
                    print("Hit 401 error. Fetching new token and trying...")
                    token = get_management_api_token()
                    # redo the last attempt
                    headers = {
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    }
                    response = requests.patch(
                        f"{url}/{user_id}", json={"blocked": blocked}, headers=headers
                    )
                    response.raise_for_status()

        print(f'{user["email"]}: {"blocked" if blocked else "unblocked"}')
        time.sleep(1)


if __name__ == "__main__":
    args = get_cli_args()
    blocked = args.mode == "block"
    dry_run = args.no_dry_run == False
    update_user_status(blocked, dry_run)
