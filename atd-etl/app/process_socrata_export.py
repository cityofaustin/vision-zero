#!/usr/bin/env python
"""
Socrata - Exporter
Author: Austin Transportation Department, Data & Technology Services

Description: The purpose of this script is to gather data from Hasura
and export it to the Socrata database.

The application requires the requests and sodapy libraries:
    https://pypi.org/project/requests/
    https://pypi.org/project/sodapy/
"""
import os
import time
from string import Template
from sodapy import Socrata
from process.config import ATD_ETL_CONFIG
from process.helpers_socrata import *
from process.socrata_queries import *

print("Socrata - Exporter:  Started.")

# Setup connection to Socrata
client = Socrata(
    "data.austintexas.gov",
    ATD_ETL_CONFIG["SOCRATA_APP_TOKEN"],
    username=ATD_ETL_CONFIG["SOCRATA_KEY_ID"],
    password=ATD_ETL_CONFIG["SOCRATA_KEY_SECRET"],
    timeout=20,
)

# Define tables to query from Hasura and publish to Socrata
query_configs = [
    {
        "table": "crash",
        "template": crashes_query_template,
        "formatter": format_crash_data,
        "formatter_config": {
            "tables": ["atd_txdot_crashes"],
            "columns_to_rename": {
                "veh_body_styl_desc": "unit_desc",
                "veh_unit_desc_desc": "unit_mode",
                "latitude_primary": "latitude",
                "longitude_primary": "longitude",
                "atd_fatality_count": "death_cnt",
            },
        },
        "dataset_uid": ATD_ETL_CONFIG["SOCRATA_DATASET_CRASHES"]
    },
    {
        "table": "person",
        "template": people_query_template,
        "formatter": format_person_data,
        "formatter_config": {
            "tables": ["atd_txdot_person", "atd_txdot_primaryperson"],
            "columns_to_rename": {"primaryperson_id": "person_id"},
            "prefixes": {"person_id": "P", "primaryperson_id": "PP",},
        },
        "dataset_uid": ATD_ETL_CONFIG["SOCRATA_DATASET_PERSONS"]
    },
]

# Start timer
start = time.time()

# For each config, get records from Hasura and upsert to Socrata until res is []
for config in query_configs:
    print(f'Starting {config["table"]} table...')
    print(f'Truncating {config["table"]} table...')
    client.replace(config["dataset_uid"], [])
    records = None
    offset = 0
    limit = 1000
    total_records = 0

    # Query records from Hasura and upsert to Socrata
    while records != []:
        # Create query, increment offset, and query DB
        query = config["template"].substitute(
            limit=limit,
            offset=offset,
            date_limit=get_date_limit(),
            initial_date_limit=get_initial_date_limit()
        )
        offset += limit
        data = run_hasura_query(query)

        if "data" not in data:
            print("query: ", query)
            print("data: ", data)
            raise RuntimeError("There was a problem gathering data.")

        # Format records
        records = config["formatter"](data, config["formatter_config"])

        # Upsert records to Socrata
        client.upsert(config["dataset_uid"], records)
        total_records += len(records)

        if len(records) == 0:
            print(f'{total_records} {config["table"]} records upserted.')
            print(f'Completed {config["table"]} table.')
        elif total_records != 0:
            print(f"{total_records} records upserted")

# Terminate Socrata connection
client.close()

# Stop timer and print duration
end = time.time()
hours, rem = divmod(end - start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds))
