


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
