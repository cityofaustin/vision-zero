import os

import requests

from utils.exceptions import HasuraAPIError

ENDPOINT = os.getenv("HASURA_GRAPHQL_ENDPOINT")
ADMIN_SECRET = os.getenv("HASURA_GRAPHQL_ADMIN_SECRET")

GET_PERSON_IMAGE_METADATA = """
query GetPersonImage($person_id: Int!) {
  people_by_pk(id: $person_id) {
    image_s3_object_key
    image_original_filename
  }
}
"""

GET_PERSON_IMAGE_METADATA_FULL = """
query GetPersonImageFull($person_id: Int!) {
  people_by_pk(id: $person_id) {
    image_s3_object_key
    image_source
    image_original_filename
  }
}
"""


UPDATE_PERSON_IMAGE_METADATA = """
mutation UpdatePersonImage($person_id: Int!, $object: people_set_input!) {
  update_people(_set: $object, where: {id: {_eq: $person_id}}) {
    returning {
      image_s3_object_key
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


GET_CRASH_DIAGRAM_METADATA = """
query GetCrashDiagramMetadata($record_locator: String!) {
  crashes(where: {record_locator: {_eq: $record_locator}}) {
    diagram_s3_object_key
  }
}
"""

UPDATE_CRASH_DIAGRAM_METADATA = """
mutation UpdateCrashDiagramMetadata($record_locator: String!, $object: crashes_set_input!) {
  update_crashes(where: {record_locator: {_eq: $record_locator}}, _set: $object) {
    affected_rows
  }
}
"""
