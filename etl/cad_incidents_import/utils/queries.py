UPSERT_CAD_INCIDENTS_MUTATION = """
mutation UpsertCADIncidents($objects: [cad_incidents_insert_input!]!) {
    insert_cad_incidents(
        objects: $objects, 
        on_conflict: {
            constraint: cad_incidents_master_incident_id_key,
            update_columns: [$updateColumns]
        }
      ) {
        affected_rows
    }
}
"""

UPSERT_CAD_INCIDENT_GROUPS_MUTATION = """
mutation UpsertCADIncidentGRoups($objects: [cad_incident_groups_insert_input!]!) {
    insert_cad_incident_groups(
        objects: $objects,
        on_conflict: {
            constraint: cad_incident_groups_incident_group_id_master_incident_id_key,
            update_columns: []
        }
      ) {
        affected_rows
    }
}
"""


GET_UNPROCESSED_INCIDENTS = """
query GetUnprocessed($record_limit: Int!, $date_limit: timestamptz = "") {
    cad_incidents(
        where: { 
            vz_incident_id: { _is_null: true }
            response_date: { _lt: $date_limit } 
        }
        order_by: { response_date: desc }
        limit: $record_limit
    ) {
        master_incident_id
        response_date
        latitude
        longitude
        address
    }
}
"""

GET_POTENTIAL_MATCHES = """
query GetPotentialMatches(
    $incident_id: Int!
    $geom: geometry!
    $start: timestamptz!
    $end: timestamptz!
    $distance: Float!
) {
    cad_incidents(
        where: {
            master_incident_id: { _neq: $incident_id }
            response_date: { _gte: $start, _lte: $end }
            geom: { _st_d_within: { distance: $distance, from: $geom } }
        }
    ) {
        master_incident_id
        response_date
        latitude
        longitude
        address
    }
}
"""

INSERT_VZ_INCIDENT = """
mutation InsertVzIncident {
    insert_vz_incidents_one(object: {}) {
        id
    }
}
"""

SET_VZ_INCIDENT_IDS = """
mutation UpdateGroupMembers($ids: [Int!]!, $vz_incident_id: bigint!) {
    update_cad_incidents(
        where: { master_incident_id: { _in: $ids } }
        _set: { vz_incident_id: $vz_incident_id }
    ) {
        affected_rows
    }
}
"""
