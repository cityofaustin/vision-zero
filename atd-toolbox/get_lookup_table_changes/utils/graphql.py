import os

import requests

HASURA_GRAPHQL_ENDPOINT = os.getenv(
    "HASURA_GRAPHQL_ENDPOINT", "http://localhost:8084/v1/graphql"
)
HASURA_GRAPHQL_ADMIN_SECRET = os.getenv("HASURA_GRAPHQL_ADMIN_SECRET", "hasurapassword")

LOOKUP_TABLE_QUERY = """
query GetLookupTables {
  _lookup_tables_view {
    table_name
  }
}
"""

LOOKUP_TABLE_VALUES_QUERY_TEMPLATE = """
    query LookupTableValues_$table_name {
        lookups_$table_name(where: {source: {_eq: "cris"}}, order_by: {id: asc}) {
            id
            label
            source
        }
    }
"""


class HasuraAPIError(Exception):
    """Indicates an error when interacting with the Hasura graphQL API"""

    pass


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
    if not HASURA_GRAPHQL_ENDPOINT:
        raise OSError("HASURA_GRAPHQL_ENDPOINT env var is missing/None")
    if not HASURA_GRAPHQL_ADMIN_SECRET:
        raise OSError("HASURA_GRAPHQL_ADMIN_SECRET env var is missing/None")

    payload = {"query": query, "variables": variables}
    res = requests.post(
        HASURA_GRAPHQL_ENDPOINT,
        json=payload,
        headers={"x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET},
    )
    res.raise_for_status()
    data = res.json()
    try:
        return data["data"]
    except (KeyError, TypeError) as err:
        raise HasuraAPIError(data) from err
