import os
import json
import requests

RUN_MODE = os.getenv("RUN_MODE", "STAGING")
HASURA_ADMIN_SECRET = os.getenv("HASURA_ADMIN_SECRET")
HASURA_ADMIN_SECRET_STAGING = os.getenv("HASURA_ADMIN_SECRET_STAGING")

def run_query(query):  # A simple function to use requests.post to make the API call. Note the json= section.
    # Assume staging
    endpoint_mode = "vzd-staging" # Staging by default
    token = HASURA_ADMIN_SECRET_STAGING

    if RUN_MODE == "PRODUCTION":
        endpoint_mode = "vzd"
        token = HASURA_ADMIN_SECRET

    headers = {"x-hasura-admin-secret": token}
    try:
        return requests.post("https://" + endpoint_mode + ".austinmobility.io/v1/graphql",
                             json={'query': query},
                             headers=headers).json()
    except:
        return None