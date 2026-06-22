COLUMNS = {
    "cols_to_rename": {
        "cad_incidents": {
            "time_callclosed": "time_call_closed",
        },
    },
    "required_columns": {
        "cad_incidents": [
            "address",
            "agency_type",
            "call_disposition",
            "final_problem",
            "incident_type",
            "initial_problem",
            "master_incident_id",
            "master_incident_number",
            "priority_description",
            "priority_number",
            "response_date",
            "time_call_closed",
            "time_first_unit_arrived",
            "latitude",
            "longitude",
        ],
        "cad_incident_groups": {"master_incident_id", "incident_group_id"},
    },
}
