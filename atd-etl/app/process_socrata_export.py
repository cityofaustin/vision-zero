#!/usr/bin/env python
"""
Socrata - Exporter
Author: Austin Transportation Department, Data and Technology Office

Description: The purpose of this script is to gather data from Hasura
and export it to the Socrata database.

The application requires the requests and sodapy libraries:
    https://pypi.org/project/requests/
    https://pypi.org/project/sodapy/
"""
import os
import time
from sodapy import Socrata
from string import Template
from process.helpers_socrata import *
from process.config import ATD_ETL_CONFIG
from process.socrata_queries import *
print("Socrata - Exporter:  Started.")
print("SOCRATA_KEY_ID: " + ATD_ETL_CONFIG["SOCRATA_KEY_ID"])
print("SOCRATA_KEY_SECRET: " + ATD_ETL_CONFIG["SOCRATA_KEY_SECRET"])

# Setup connection to Socrata
client = Socrata("data.austintexas.gov", ATD_ETL_CONFIG["SOCRATA_APP_TOKEN"],
                 username=ATD_ETL_CONFIG["SOCRATA_KEY_ID"], password=ATD_ETL_CONFIG["SOCRATA_KEY_SECRET"], timeout=20)

# People config
# people_query_template = Template(
#     """
#     query getPeopleSocrata {
#         atd_txdot_person(limit: $limit, offset: $offset, order_by: {person_id: asc}, where: {_or: [{prsn_injry_sev_id: {_eq: 1}}, {prsn_injry_sev_id: {_eq: 4}}], _and: {crash: {city_id: {_eq: 22}}}}) {
#             person_id
#             prsn_injry_sev_id
#             prsn_age
#             prsn_gndr_id
#             crash {
#                 crash_date
#             }
#         }
#         atd_txdot_primaryperson(limit: $limit, offset: $offset, order_by: {primaryperson_id: asc}, where: {_or: [{prsn_injry_sev_id: {_eq: 1}}, {prsn_injry_sev_id: {_eq: 4}}], _and: {crash: {city_id: {_eq: 22}}}}) {
#             primaryperson_id
#             prsn_injry_sev_id
#             prsn_age
#             prsn_gndr_id
#             drvr_zip
#             crash {
#                 crash_date
#             }
#         }
#     }
# """
# )

# person_id_prefixes = {
#     "person_id": "P",
#     "primaryperson_id": "PP",
# }

# person_columns_to_rename = {
#     "primaryperson_id": "person_id"
# }

# Start timer
start = time.time()

# Queries
queries_config = [
    {
        "template": crashes_query_template,
        "formatter": format_crash_data,
        "formatter_config": {
            "tables": ["atd_txdot_crashes"],
            "columns_to_rename": {
                "veh_body_styl_desc": "unit_desc",
                "veh_unit_desc_desc": "unit_mode",
            },
            "flags_list": ["MOTOR VEHICLE",
                           "TRAIN",
                           "PEDALCYCLIST",
                           "PEDESTRIAN",
                           "MOTORIZED CONVEYANCE",
                           "TOWED/PUSHED/TRAILER",
                           "NON-CONTACT",
                           "OTHER"]
        },
        "dataset_uid": "y2wy-tgr5"
    },
    # people: {
    #     template: people_query_template,
    #     formatter: format_person_data,
    #     formatter_config: {
    #         tables: ["atd_txdot_person", "atd_txdot_primaryperson"],
    #         columns_to_rename = {
    #             "primaryperson_id": "person_id"
    #         },
    #         prefixes: {
    #             "person_id": "P",
    #             "primaryperson_id": "PP",
    #         }
    #     }
    #     dataset_uid: "xecs-rpy9"
    # }
]

# Get records from Hasura until res is [] (Crashes)
for config in queries_config:
    records = None
    offset = 0
    limit = 6000
    total_records_published = 0

    # while loop to request records from Hasura and post to Socrata
    while records != []:
        # Create query, increment offset, and query DB
        query = config["template"].substitute(
            limit=limit, offset=offset)
        offset += limit
        data = run_hasura_query(query)

        # Format records
        records = config["formatter"](data, config["formatter_config"])

        # Upsert records to Socrata
        client.upsert(config["dataset_uid"], records)
        total_records_published += len(records)
        print(f"{total_records_published} records published")

# Get records from Hasura until res is [] (People)
# while records != []:
#     # Create query, increment offset, and query DB
#     people_query = people_query_template.substitute(
#         limit=limit, offset=offset)
#     offset += limit
#     people = run_hasura_query(people_query)

#     # Format records
#     person_records = people['data']['atd_txdot_person']
#     person_records = add_value_prefix(person_records, person_id_prefixes)
#     primary_person_records = people['data']['atd_txdot_primaryperson']
#     primary_person_records = add_value_prefix(
#         primary_person_records, person_id_prefixes)
#     people_records = person_records + primary_person_records
#     records = people_records
#     people_records = rename_record_columns(
#         people_records, person_columns_to_rename)
#     people_records = formatted_records = flatten_hasura_response(
#         people_records)

# # Upsert records to Socrata
#     client.upsert("xecs-rpy9", people_records)
#     total_records_published += len(people_records)
#     print(f"{total_records_published} records published")

# Terminate Socrata connection
client.close()

# Stop timer and print duration
end = time.time()
hours, rem = divmod(end-start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(
    int(hours), int(minutes), seconds))
