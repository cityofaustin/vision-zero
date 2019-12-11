#!/usr/bin/env python
"""
Process - Geocoder Helper
Author: Austin Transportation Department, Data and Technology Services

Description: The purpose of this script is to find records that do not have
latitude/longitude coordinates and based on pre-determined business logic.
The accuracy of the geocoder is contingent on the quality of the addresses
provided in the data; therefore, data refining needs to be a priority for
when designing business logic or philosophy.

The application requires the requests library:
    https://pypi.org/project/requests/
"""

import requests
import os
import json

#
# We need to import our configuration, and the run_query method
#
from .config import ATD_ETL_CONFIG
from .request import run_query


def get_geocode_list():
    """
    Returns a list of records that need to be geocoded.
    :return: dict
    """
    non_geocoded_records = """
    query getCrashesNoCoordinates {
      atd_txdot_crashes(
        where: {
          longitude: {_is_null: true}
          latitude: {_is_null: true}
          latitude_geocoded: {_is_null: true}
          longitude_geocoded: {_is_null: true}
          latitude_primary: {_is_null: true}
          longitude_primary: {_is_null: true}
        },
        limit: %s
      ) {
        crash_id
        geocoded
        rpt_block_num
        rpt_street_pfx
        rpt_street_name
        rpt_street_sfx
        rpt_sec_block_num
        rpt_sec_street_pfx
        rpt_sec_street_name
        rpt_sec_street_sfx
        rpt_city_id
        rpt_cris_cnty_id
      }
    }
    """ % (ATD_ETL_CONFIG["ATD_HERE_RECORDS_PER_RUN"])

    return run_query(non_geocoded_records)


def build_address(record, primary=True):
    """
    Builds a geo-codable street
    :param record: dict - The individual record as provided by get_geocode_list
    :return: string
    """
    final_address = ""

    if primary:
        final_address = f'{record["rpt_block_num"]} {record["rpt_street_pfx"]} {record["rpt_street_name"]} {record["rpt_street_sfx"]}'
    else:
        final_address = f'{record["rpt_sec_block_num"]} {record["rpt_sec_street_pfx"]} {record["rpt_sec_street_name"]} {record["rpt_sec_street_sfx"]}'

    final_address = final_address \
        .replace("None", "") \
        .replace("null", "") \
        .replace(" ,", ",") \
        .replace("  ", " ").strip()

    return final_address


def is_faulty_street(street):
    """
    Returns true if the street contains any of the below strings
    :param street: string - The name of the string
    :return: bool
    """

    if "NOT REPORTED" in street:
        return True

    return False


def geocode_address_here(address):
    """
    Runs a geocode request against the Here API
    :param address: string - The address to pass to the Here endpoint.
    :return: string
    """

    # Build our parameters
    parameters = {
        "gen": "9",
        "app_id": ATD_ETL_CONFIG["ATD_HERE_APP_ID"],
        "app_code": ATD_ETL_CONFIG["ATD_HERE_APP_CODE"],
        "mapview": ATD_ETL_CONFIG["ATD_HERE_BOUNDING_BOX"],
        "searchtext": address,
    }

    try:
        # Make request to API Endpoint
        return requests.get(ATD_ETL_CONFIG["ATD_HERE_API_ENDPOINT"], params=parameters).json()
        # coordinates = request.json()['Response']['View'][0]['Result'][0]['Location']['DisplayPosition']
    except Exception as e:
        return {
            "error": str(e)
        }

    return {}
