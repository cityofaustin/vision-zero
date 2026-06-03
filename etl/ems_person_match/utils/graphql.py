import os

import requests

from utils.exceptions import HasuraAPIError, EMSPersonIdError

ENDPOINT = os.getenv("HASURA_GRAPHQL_ENDPOINT")
ADMIN_SECRET = os.getenv("HASURA_GRAPHQL_ADMIN_SECRET")

GET_UNMATCHED_EMS_PCRS_TO_CRASHES = """
query GetEMSTodo {
  ems__incidents(
    order_by: { id: desc }
    where: {
      crash_match_status: {_in: ["unmatched"]},
      person_match_status: {_neq: "unmatched_by_manual_qa"},
      apd_incident_numbers: {_is_null: false},
      crash_pk: {_is_null: true},
      is_deleted: {_eq: false}
    }) {
    id
    incident_number
  }
}
"""

GET_UNMATCHED_EMS_PCRS_TO_NON_CR3S = """
query GetEMSTodo {
  ems__incidents(
    order_by: { id: desc }
    where: {
      non_cr3_match_status: {_eq: "unmatched"},
      apd_incident_numbers: {_is_null: false},
      atd_apd_blueform_case_id: {_is_null: true},
      is_deleted: {_eq: false}
    }) {
    id
    incident_number
  }
}
"""

GET_UNMATCHED_EMS_PCRS_TO_PEOPLE = """
query GetEMSTodo {
  ems__incidents(
    order_by: { id: desc }
    where: {
      person_match_status: {_in: ["unmatched", "multiple_matches_by_automation"]},
      crash_pk: {_is_null: false},
      person_id: {_is_null: true},
      is_deleted: {_eq: false}
    }) {
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
    atd_apd_blueform_case_id
    crash_match_status
    incident_location_address
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
    apd_incident_numbers
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
    mode_desc
    prsn_injry_sev_id
    prsn_taken_to
  }
}
"""

GET_CRASH_BY_APD_CASE_ID = """
query GetCrashByApdCaseId($case_id: String!) {
  crashes(where: {case_id: {_eq: $case_id},
    investigat_agency_id:{_eq: 74},
    is_deleted: {_eq: false}}) {
    id
    address_display
    rpt_street_name
    rpt_sec_street_name
    crash_timestamp
    record_locator
  }
}
"""

GET_NON_CR3_BY_APD_CASE_ID = """
query GetNonCR3ByApdCaseId($case_id: Int!) {
  atd_apd_blueform(where: {case_id: {_eq: $case_id}, is_deleted: {_eq: false}}) {
    form_id
    case_id
    address
  }
}
"""


UPDATE_EMS_PCR = """
mutation UpdateEMSIncidentPCR($id: Int!, $updates: ems__incidents_set_input!) {
  update_ems__incidents_by_pk(pk_columns: {id: $id}, _set: $updates) {
    id
  }
}
"""

UPDATE_EMS_PCRs_BY_INCIDENT_NUMBER = """
mutation UpdateEMSIncidentPCR($incident_number: String!, $updates: ems__incidents_set_input!) {
  update_ems__incidents(where: {incident_number: {_eq: $incident_number}}, _set: $updates) {
    affected_rows
  }
}
"""


def is_person_id_conflict(errors):
    """Inspect a Hasura API errors to check for an ems__incidents_person_id_key
    unique constraint conflict.

    Args:
        hasuraErrors (bool): _description_
    """
    for err in errors:
        dbError = err.get("extensions", {}).get("internal", {}).get("error", None)
        if dbError and "ems__incidents_person_id_key" in dbError["message"]:
            return True
        return False
    return False


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
        if data["errors"] and is_person_id_conflict(data["errors"]):
            raise EMSPersonIdError(data) from err
        else:
            raise HasuraAPIError(data) from err
