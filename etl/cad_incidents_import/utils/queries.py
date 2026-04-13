


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
