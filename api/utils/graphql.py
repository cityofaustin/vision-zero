import os

import requests

from utils.exceptions import HasuraAPIError

ENDPOINT = os.getenv("HASURA_GRAPHQL_ENDPOINT")
ADMIN_SECRET = os.getenv("HASURA_GRAPHQL_ADMIN_SECRET")


UPDATE_PERSON_IMAGE_METADATA = """
mutation UpdateImage($image_filename: String!, $person_id: Int!, $updated_by: String!) {
  update_people(_set: {image_filename: $image_filename, updated_by: $updated_by}, where: {id: {_eq: $person_id}}) {
    returning {
      image_filename
      id
    }
  }
}
"""



def make_hasura_request(*, query, variables=None):
    """Make a POST request to the graphql API.

    Requires HASURA_GRAPHQL_ENDPOINT env var.

    Args:
        query (str): the graphql query
        variables (dict, optional): the query variables. Defaults to None.
    Raises:
        HasuraAPIError: If the API response JSON does not contain a top-level `data`
            property
    Returns:
        dict: The `data` property of the JSON response
    """
    if not ENDPOINT:
        raise OSError("HASURA_GRAPHQL_ENDPOINT env var is missing/None")
    payload = {"query": query, "variables": variables}
    res = requests.post(
        ENDPOINT, json=payload, headers={"x-hasura-admin-secret": ADMIN_SECRET}
    )
    res.raise_for_status()
    data = res.json()
    try:
        return data["data"]
    except KeyError as err:
        raise HasuraAPIError(data) from err
