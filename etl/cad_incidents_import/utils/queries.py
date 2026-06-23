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
query GetUnprocessed(
    $record_table_name: String!
    $match_status: String!
    $record_limit: Int!
    $date_limit: timestamptz!
) {
    vz_incident_records_view(
        where: { 
            vz_incident_match_status: { _eq: $match_status } 
            record_table_name: { _eq: $record_table_name }
            record_timestamp: { _lt: $date_limit } 
        }
        # todo: flip order to asc
        order_by: { record_timestamp: desc }
        limit: $record_limit
    ) {
        record_id
        record_incident_number
        record_responding_agency
        record_timestamp
        record_address
        geom
    }
}
"""

GET_INCIDENT_NUMBER_MATCHES = """
query GetIncidentNumberMatches(
    $record_id: bigint!
    $target_table_name: String!
    $target_incident_number: String!
) {
    vz_incident_records_view(
        where: {
            vz_incident_id: { _is_null: false }
            record_id: { _neq: $record_id }
            record_table_name: { _eq: $target_table_name }
            record_incident_number: { _eq: $target_incident_number }
        }
    ) {
        vz_incident_id
        record_id
        record_table_name
    }
}
"""

GET_GEO_TEMPORAL_MATCHES = """
query GetGeoTemporalMatches(
    $record_id: bigint!
    $geom: geometry!
    $start: timestamptz!
    $end: timestamptz!
    $distance: Float!
) {
    vz_incident_records_view(
        where: {
            vz_incident_id: { _is_null: false }
            record_id: { _neq: $record_id }
            record_timestamp: { _gte: $start, _lte: $end }
            geom: { _st_d_within: { distance: $distance, from: $geom } }
        }
    ) {
        vz_incident_id
        record_id
        record_table_name
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

SET_CRASH_VZ_INCIDENT_MATCH = """
mutation SetVzIncidentId(
    $record_id: Int!
    $vz_incident_id: bigint = null
    $vz_incident_match_status: String!
    $vz_incident_matched_ids: [bigint!] = []
    ) {
    update_crashes(
        where: { id: { _eq: $record_id } }
        _set: { 
            vz_incident_id: $vz_incident_id
            vz_incident_matched_ids: $vz_incident_matched_ids 
            vz_incident_match_status: $vz_incident_match_status
        }
    ) {
        affected_rows
    }
}
"""


SET_CAD_VZ_INCIDENT_MATCH = """"""

SET_EMS_VZ_INCIDENT_MATCH = """
mutation SetVzIncidentId(
    $record_id: Int!
    $vz_incident_id: bigint = null
    $vz_incident_match_status: String!
    $vz_incident_matched_ids: [bigint!] = []
    ) {
    update_ems__incidents(
        where: { id: { _eq: $record_id } }
        _set: { 
            vz_incident_id: $vz_incident_id
            vz_incident_matched_ids: $vz_incident_matched_ids 
            vz_incident_match_status: $vz_incident_match_status
        }
    ) {
        affected_rows
    }
}
"""

SET_AFD_INCIDENT_MATCH = """
mutation SetVzIncidentId(
    $record_id: Int!
    $vz_incident_id: bigint = null
    $vz_incident_match_status: String!
    $vz_incident_matched_ids: [bigint!] = []
    ) {
    update_afd__incidents(
        where: { id: { _eq: $record_id } }
        _set: { 
            vz_incident_id: $vz_incident_id
            vz_incident_matched_ids: $vz_incident_matched_ids 
            vz_incident_match_status: $vz_incident_match_status
        }
    ) {
        affected_rows
    }
}
"""