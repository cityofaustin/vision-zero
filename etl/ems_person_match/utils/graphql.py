import os

import requests

from utils.exceptions import HasuraAPIError
    
# ENDPOINT = os.getenv("HASURA_GRAPHQL_ENDPOINT")
# ADMIN_SECRET = os.getenv("HASURA_GRAPHQL_ADMIN_SECRET")
ENDPOINT = "http://0.0.0.0:8084/v1/graphql"
ADMIN_SECRET = "hasurapassword"

GET_UNMATCHED_EMS_PCRS = """
query GetEMSTodo {
  ems__incidents(limit: 5000, where: {crash_pk: {_is_null: false}, person_id: {_is_null: true}, is_deleted: { _eq: false } }) {
    id
    incident_number
  }
}
"""

GET_EMS_PCRS_BY_INCIDENT_NUMBER = """
query GetEMSPCRsByIncident($incident_number: String!) {
  ems__incidents(where: {incident_number: {_eq: $incident_number} , is_deleted: { _eq: false } }) {
    id
    incident_number
    crash_pk
    crash_match_status
    mvc_form_position_in_vehicle
    pcr_patient_age
    pcr_patient_race
    pcr_patient_gender
    pcr_transport_destination
    patient_injry_sev_id
    person_match_status
    matched_person_ids
    person_id
    travel_mode
  }
}
"""

GET_UNMATCHED_CRASH_PEOPLE = """
query GetUnmatchedCrashPeople($crash_pk: Int!, $matched_ids: [Int!]) {
  people_list_view(where: {crash_pk: {_eq: $crash_pk}, id: {_nin: $matched_ids}}) {
    id
    drvr_ethncty {
      label
    }
    gndr {
      label
    }
    prsn_age
    prsn_occpnt_pos_id
    occpnt_pos {
      id
      label
    }
    prsn_injry_sev_id
    prsn_taken_to
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
    except (KeyError, TypeError) as err:
        breakpoint()
        raise HasuraAPIError(data) from err


def create_log_entry(
    *, s3_file_key=None, extract_name=None, local_zip_file_path=None, **kwargs
):
    """Insert a new entry in the `_cris_import_log` tracking table.

    Args:
        s3_file_key (str, optional): the S3 file key of the extract. Defaults to None.
        extract_name (str, optional): the name of the extract. required if s3_file_key is None.

    Returns:
        int: the record ID of the log entry that was created
    """
    if not s3_file_key and not extract_name:
        raise ValueError("s3_file_key or extract_name are required to create log entry")

    object_name = (
        s3_file_key
        if s3_file_key
        else local_zip_file_path if local_zip_file_path else extract_name
    )

    variables = {
        "data": {
            "object_path": s3_file_key if s3_file_key else "local",
            "object_name": object_name,
        }
    }
    data = make_hasura_request(
        query=CRIS_IMPORT_LOG_INSERT_MUTATION, variables=variables
    )
    return data["insert__cris_import_log_one"]["id"]


def update_log_entry(*, log_entry_id, payload):
    """Update a cris_activity_log record

    Args:
        log_entry_id (int): the log record ID
        payload (dict): the record values to update. typically a combination of:
            - completed_at (str): the utc iso timestamp at which the import completed
            - records_processed (dict): a dict with the number of records processed by table type.
                E.g.: {"crashes": 0,"units": 0,"persons": 0,"charges": 0,"pdfs": 0}
    """
    variables = {
        "id": log_entry_id,
        "data": payload,
    }
    make_hasura_request(query=CRIS_IMPORT_LOG_UPDATE_MUTATION, variables=variables)
