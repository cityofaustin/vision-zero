COLUMNS = {
    "ems": {
        "cols_to_rename": {
            "mvc_form_extrication_time": "mvc_form_extrication_datetime",
            "incident_location_longitude": "longitude",
            "incident_location_latitude": "latitude",
        },
        "cols_to_delete": ["incident_date_received", "incident_time_received"],
        # we assume EMS records do not change upstream, per Lynn C. at EMS
        "update_columns": [],
    },
    "afd": {
        "cols_to_rename": {
            "cad_address": "address",
            "cad_problem": "problem",
            "calendaryear": "calendar_year",
            "ems_incidentnumber": "ems_incident_numbers",
            "inc_time": "call_datetime",
            "x": "longitude",
            "y": "latitude",
        },
        "cols_to_delete": ["inc_date"],
        "update_columns": [
            "unparsed_ems_incident_number",
            "ems_incident_numbers",
            "call_datetime",
            "calendar_year",
            "jurisdiction",
            "address",
            "problem",
            "flagged_incs",
            "geometry",
            "latitude",
            "longitude",
        ],
    },
}
