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
from copy import deepcopy
import requests
import json
import os
import time
from process.config import ATD_ETL_CONFIG
print("Socrata - Exporter:  Not yet implemented.")
print("SOCRATA_KEY_ID: " + ATD_ETL_CONFIG["SOCRATA_KEY_ID"])
print("SOCRATA_KEY_SECRET: " + ATD_ETL_CONFIG["SOCRATA_KEY_SECRET"])

# Setup connection to Socrata
client = Socrata("data.austintexas.gov", ATD_ETL_CONFIG["SOCRATA_APP_TOKEN"],
                 username=ATD_ETL_CONFIG["SOCRATA_KEY_ID"], password=ATD_ETL_CONFIG["SOCRATA_KEY_SECRET"])


def run_hasura_query(query):

    # Build Header with Admin Secret
    headers = {
        "x-hasura-admin-secret": ATD_ETL_CONFIG["HASURA_ADMIN_KEY"]
    }

   # Try making insertion
    try:
        return requests.post(ATD_ETL_CONFIG["HASURA_ENDPOINT"],
                             json={'query': query, "offset": offset},
                             headers=headers).json()
    except Exception as e:
        print("Exception, could not insert: " + str(e))
        print("Query: '%s'" % query)
        return None


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


def flatten_hasura_response(records):
    formatted_records = []
    for record in records:
        # Create copy of record to mutate
        formatted_record = deepcopy(record)
        # Look through key values for data lists
        for k, v in record.items():
            # If list is found, iterate to bring key values to top-level
            if type(v) == list:
                for item in v:
                    for key, value in item.items():
                        # Handle nested values
                        if type(value) == dict:
                            # Handles concat of values here
                            print(f"Nested: {value}")
                            for nested_key, nested_value in value.items():
                                if nested_key in formatted_record.keys():
                                    # If key already exists at top-level, concat with existing values
                                    next_record = f"|{nested_value}"
                                    formatted_record[nested_key] = formatted_record[nested_key] + next_record
                                else:
                                    # Create key at top-level
                                    formatted_record[nested_key] = nested_value
                        # Copy non-nested key-values to top-level
                        else:
                            formatted_record[key] = value
                # Remove key with values that were moved to top-level
                del formatted_record[k]
        formatted_records.append(formatted_record)
    return formatted_records


# Start timer
start = time.time()

# while loop to request records from Hasura and post to Socrata
records = None
offset = 3
limit = 1
total_records_published = 0

# Get records from Hasura until res is []
# while records != []:
#     crashes_query = crashes_query_template.substitute(
#         limit=limit, offset=offset)
#     offset += limit
#     crashes = run_hasura_query(crashes_query)
#     records = crashes['data']['atd_txdot_crashes']

#     # Upsert records to Socrata
#     client.upsert("rrxh-grh6", records)
#     total_records_published += len(records)
#     print(f"{total_records_published} records published")

crashes_query = crashes_query_template.substitute(
    limit=limit, offset=offset)
crashes = run_hasura_query(crashes_query)
records = crashes['data']['atd_txdot_crashes']
formatted_records = flatten_hasura_response(records)
print(formatted_records[0])


# Terminate Socrata connection
client.close()

# Stop timer and print duration
end = time.time()
hours, rem = divmod(end-start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(
    int(hours), int(minutes), seconds))
