MUTATIONS = {
    "ems": """
        mutation UpsertEmsIncidents($objects: [ems__incidents_insert_input!]!) {
            insert_ems__incidents(
                objects: $objects, 
                on_conflict: {
                    constraint: unique_pcr_key,
                    update_columns: [$updateColumns]
                }) {
                affected_rows
            }
        }
    """,
    "afd": """
        mutation UpsertAfdncidents($objects: [afd__incidents_insert_input!]!) {
            insert_afd__incidents(
                objects: $objects, 
                on_conflict: {
                    constraint: unique_incident_number,
                    update_columns: [$updateColumns]
                }) {
                affected_rows
            }
        }
    """,
}
