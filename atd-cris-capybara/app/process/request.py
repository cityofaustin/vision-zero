import os
import requests

HASURA_ADMIN_SECRET = os.getenv("HASURA_ADMIN_SECRET")
HASURA_ADMIN_SECRET_STAGING = os.getenv("HASURA_ADMIN_SECRET_STAGING")

def run_query(query, production=False):  # A simple function to use requests.post to make the API call. Note the json= section.
    # Assume staging
    endpoint_mode = "vzd-staging" # Staging by default
    token = HASURA_ADMIN_SECRET_STAGING

    if production:
        endpoint_mode = "vzd"
        token = HASURA_ADMIN_SECRET

    headers = {"x-hasura-admin-secret": token}
    return requests.post("https://" + endpoint_mode + ".austinmobility.io/v1/graphql",
                         json={'query': query},
                         headers=headers).json()