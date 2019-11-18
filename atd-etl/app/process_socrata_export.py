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

from sodapy import Socrata
from string import Template
from process.helpers_socrata import *
import os
import time
from process.config import ATD_ETL_CONFIG
print("Socrata - Exporter:  Started.")
print("SOCRATA_KEY_ID: " + ATD_ETL_CONFIG["SOCRATA_KEY_ID"])
print("SOCRATA_KEY_SECRET: " + ATD_ETL_CONFIG["SOCRATA_KEY_SECRET"])

# Setup connection to Socrata
client = Socrata("data.austintexas.gov", ATD_ETL_CONFIG["SOCRATA_APP_TOKEN"],
                 username=ATD_ETL_CONFIG["SOCRATA_KEY_ID"], password=ATD_ETL_CONFIG["SOCRATA_KEY_SECRET"])

crashes_query_template = Template(
    """
    query getCrashesSocrata {
        atd_txdot_crashes (limit: $limit, offset: $offset, order_by: {crash_id: asc}, where: {city_id: {_eq: 22}}) {
            crash_id
    		crash_fatal_fl
            crash_date
            crash_time
            case_id
            rpt_latitude
            rpt_longitude
            rpt_block_num
            rpt_street_pfx
            rpt_street_name
            rpt_street_sfx
            crash_speed_limit
            road_constr_zone_fl
            latitude
            longitude
            street_name
            street_nbr
            street_name_2
            street_nbr_2
            crash_sev_id
            sus_serious_injry_cnt
            nonincap_injry_cnt
            poss_injry_cnt
            non_injry_cnt
            unkn_injry_cnt
            tot_injry_cnt
            death_cnt
            units {
                contrib_factr_p1_id
                contrib_factr_p2_id
                body_style {
                    veh_body_styl_desc
                }
                unit_description {
                    veh_unit_desc_desc
                }
            }
        }
    }
"""
)

people_query_template = Template(
    """
    query getPeopleSocrata {
        atd_txdot_person(limit: $limit, offset: $offset, order_by: {person_id: asc}, where: {_or: [{prsn_injry_sev_id: {_eq: 1}}, {prsn_injry_sev_id: {_eq: 4}}], _and: {crash: {city_id: {_eq: 22}}}}) {
            person_id
            prsn_injry_sev_id
            prsn_age
            prsn_gndr_id
            crash {
                crash_date
            }
        }
        atd_txdot_primaryperson(limit: $limit, offset: $offset, order_by: {primaryperson_id: asc}, where: {_or: [{prsn_injry_sev_id: {_eq: 1}}, {prsn_injry_sev_id: {_eq: 4}}], _and: {crash: {city_id: {_eq: 22}}}}) {
            primaryperson_id
            prsn_injry_sev_id
            prsn_age
            prsn_gndr_id
            drvr_zip
            crash {
                crash_date
            }
        }
    }
"""
)

columns_to_rename = {
    "veh_body_styl_desc": "unit_desc",
    "veh_unit_desc_desc": "unit_mode",
}

unit_modes = ["MOTOR VEHICLE",
              "TRAIN",
              "PEDALCYCLIST",
              "PEDESTRIAN",
              "MOTORIZED CONVEYANCE",
              "TOWED/PUSHED/TRAILER",
              "NON-CONTACT",
              "OTHER"]

# Start timer
start = time.time()

# while loop to request records from Hasura and post to Socrata
records = None
offset = 0
limit = 1
total_records_published = 0

# Get records from Hasura until res is [] (Crashes)
# while records != []:
#     crashes_query = crashes_query_template.substitute(
#         limit=limit, offset=offset)
#     offset += limit
#     crashes = run_hasura_query(crashes_query)
#     records = crashes['data']['atd_txdot_crashes']

#     # Upsert records to Socrata
#     formatted_records = flatten_hasura_response(records)
#     formatted_records = rename_record_columns(
#         formatted_records, columns_to_rename)
#     formatted_records = create_crash_mode_flags(formatted_records, unit_modes)
#     client.upsert("rrxh-grh6", formatted_records)
#     total_records_published += len(records)
#     print(f"{total_records_published} records published")

# Get records from Hasura until res is [] (People)
# while records != []:
people_query = people_query_template.substitute(
    limit=limit, offset=offset)
offset += limit
people = run_hasura_query(people_query)
records = people['data']['atd_txdot_person']

# Upsert records to Socrata
formatted_records = flatten_hasura_response(records)
print(formatted_records)
# formatted_records = rename_record_columns(
#     formatted_records, columns_to_rename)
# formatted_records = create_crash_mode_flags(formatted_records, unit_modes)
# client.upsert("rrxh-grh6", formatted_records)
# total_records_published += len(records)
# print(f"{total_records_published} records published")

# Hasura test request

# crashes_query = crashes_query_template.substitute(
#     limit=limit, offset=offset)
# crashes = run_hasura_query(crashes_query)
# records = crashes['data']['atd_txdot_crashes']
# formatted_records = flatten_hasura_response(records)
# print(formatted_records[4])


# Terminate Socrata connection
client.close()

# Stop timer and print duration
end = time.time()
hours, rem = divmod(end-start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(
    int(hours), int(minutes), seconds))
