import os
import requests

from utils.exceptions import HasuraAPIError

ENDPOINT = os.getenv("HASURA_GRAPHQL_ENDPOINT")


def make_hasura_request(*, query, variables=None):
    """Make a POST request to the graphql API. 
    
    Requires HASURA_GRAPHQL_ENDPOINT env var.

    Args:
        query (str): the graphql query
        variables (dict, optional): the query variables. Defaults to None.
    Raises:
        HasuraAPIError: If the API the response JSON not contain a top-level `data` property
    Returns:
        dict: The `data` property of the JSON response
    """
    if not ENDPOINT:
        raise OSError("HASURA_GRAPHQL_ENDPOINT env var is missing/None")
    payload = {"query": query, "variables": variables}
    res = requests.post(ENDPOINT, json=payload)
    res.raise_for_status()
    data = res.json()
    try:
        return data["data"]
    except (KeyError, TypeError) as err:
        raise HasuraAPIError(data) from err


COLUMN_METADATA_QUERY = """
query ColumnMetadata {
  _column_metadata(where: {is_imported_from_cris: {_eq: true}}) {
    column_name
    record_type
  }
}
"""

CRASH_UPSERT_MUTATION = """
mutation UpsertCrashes($objects: [crashes_cris_insert_input!]!) {
  insert_crashes_cris(
    objects: $objects, 
    on_conflict: {
        constraint: crashes_cris_crash_id_key,
        update_columns: [$updateColumns]
    }) {
    affected_rows
  }
}
"""

UNIT_UPSERT_MUTATION = """
mutation UpsertUnits($objects: [units_cris_insert_input!]!) {
  insert_units_cris(
    objects: $objects, 
    on_conflict: {
        constraint: unique_units_cris,
        update_columns: [$updateColumns]
    }) {
    affected_rows
  }
}
"""

PERSON_UPSERT_MUTATION = """
mutation UpsertPeople($objects: [people_cris_insert_input!]!) {
  insert_people_cris(
    objects: $objects, 
    on_conflict: {
        constraint: unique_people_cris,
        update_columns: [$updateColumns]
    }) {
    affected_rows
  }
}"""

CHARGES_DELETE_MUTATION = """
mutation DeleteCharges($crash_ids: [Int!]!) {
  delete_charges_cris(where: {cris_crash_id: {_in: $crash_ids}}) {
    affected_rows
  }
}
"""

CHARGES_INSERT_MUTATION = """
mutation InsertCharges($objects: [charges_cris_insert_input!]!) {
  insert_charges_cris(objects: $objects) {
    affected_rows
  }
}
"""

mutations = {
    "crashes": CRASH_UPSERT_MUTATION,
    "units": UNIT_UPSERT_MUTATION,
    "persons": PERSON_UPSERT_MUTATION,
    "charges": CHARGES_INSERT_MUTATION,
}
