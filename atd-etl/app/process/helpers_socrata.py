"""
Helpers for Socrata Export
Author: Austin Transportation Department, Data and Technology Office

Description: This script contains methods that help in the download
of records from Hasura and upserting into an existing Socrata data table.

The application requires the requests and sodapy libraries:
    https://pypi.org/project/requests/
    https://pypi.org/project/sodapy/
"""

import requests
import json
from copy import deepcopy
from process.config import ATD_ETL_CONFIG


def replace_chars(target_str, char_list, replacement_str):
    for char in char_list:
        target_str = target_str.replace(char, replacement_str)
    return target_str


def run_hasura_query(query):

    # Build Header with Admin Secret
    headers = {
        "x-hasura-admin-secret": ATD_ETL_CONFIG["HASURA_ADMIN_KEY"]
    }

   # Try making insertion
    try:
        return requests.post(ATD_ETL_CONFIG["HASURA_ENDPOINT"],
                             json={'query': query},
                             headers=headers).json()
    except Exception as e:
        print("Exception, could not insert: " + str(e))
        print("Query: '%s'" % query)
        return None


def flatten_hasura_response(records):
    formatted_records = []
    for record in records:
        # Create copy of record to mutate
        formatted_record = deepcopy(record)
        # Look through key values for data lists
        for first_level_key, first_level_value in record.items():
            # If list is found, iterate to bring key values to top-level
            if type(first_level_value) == list:
                for item in first_level_value:
                    for second_level_key, second_level_value in item.items():
                        # Handle nested values
                        if type(second_level_value) == dict:
                            # Handles concat of values here
                            for third_level_key, third_level_value in second_level_value.items():
                                if third_level_key in formatted_record.keys():
                                    # If key already exists at top-level, concat with existing values
                                    next_record = f" & {third_level_value}"
                                    formatted_record[third_level_key] = formatted_record[third_level_key] + next_record
                                else:
                                    # Create key at top-level
                                    formatted_record[third_level_key] = third_level_value
                        # Copy non-nested key-values to top-level (if not null)
                        # Null records can create unwanted columns at top level of record
                        # from keys of nested data Ex.
                        # "body_style": {
                        #       "veh_body_styl_desc": "PICKUP"
                        # }
                        #         VS.
                        # "body_style": null
                        elif second_level_value is not None:
                            formatted_record[second_level_key] = second_level_value
                # Remove key with values that were moved to top-level
                del formatted_record[first_level_key]
            # If dict is found, iterate to bring key values to top-level
            elif type(first_level_value) == dict:
                for dict_key, dict_value in first_level_value.items():
                    formatted_record[dict_key] = dict_value
                    del formatted_record[first_level_key]
        formatted_records.append(formatted_record)
    return formatted_records


def create_crash_mode_flags(records, unit_modes):
    for record in records:
        if "unit_mode" in record.keys():
            for mode in unit_modes:
                chars_to_replace = ["/", " ", "-"]

                # Need flag to be camelcase with "_fl" suffix
                formatted_mode = replace_chars(
                    mode, chars_to_replace, "_").lower()
                record_flag_column = f"{formatted_mode}_fl"
                if mode in record["unit_mode"]:
                    record[record_flag_column] = "Y"
                else:
                    record[record_flag_column] = "N"
        # Motorcycle crashes are documented in unit desc not mode
        if "unit_desc" in record.keys():
            if "MOTORCYCLE" in record["unit_desc"]:
                record["motorcycle_fl"] = "Y"
            else:
                record["motorcycle_fl"] = "N"
    return records


def rename_record_columns(records, columns_to_rename):
    for record in records:
        for key, value in columns_to_rename.items():
            if key in record.keys():
                record[value] = record.pop(key)
    return records


def add_value_prefix(records, prefix_dict):
    for record in records:
        for prefix_key, prefix_value in prefix_dict.items():
            if prefix_key in record.keys():
                record[prefix_key] = prefix_value + str(record[prefix_key])
    return records
