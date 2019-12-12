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
import datetime
import json

# Today
today = datetime.date.today()

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
          city_id: {_eq: 22}
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
    """ % (
        ATD_ETL_CONFIG["ATD_HERE_RECORDS_PER_RUN"]
    )

    return run_query(non_geocoded_records)


def update_record(crash_id, **kwargs):
    """
    Inserts lat/long into database geocoded fields.
    :param crash_id: string - The crash id
    :param kwargs: array - Additional variables we want to feed into the query
    :return: dict - JSON response from Hasura
    """

    update_crash_latlong_query = """
    mutation updateCrashGeocoded {
      update_atd_txdot_crashes(
        where: {crash_id: {_eq: %s}},
        _set: {
          geocode_date: "%s",
          geocode_match_metadata: "%s",
          geocode_match_quality: %s,
          geocode_provider: 1,
          geocode_status: "SUCCESS",
          geocoded: "Y",
          latitude_geocoded: %s,
          longitude_geocoded: %s
            }) {
        affected_rows
      }
    }
    """ % (
        crash_id,
        kwargs["geocode_date"],
        json.dumps(kwargs["geocode_match_metadata"]).replace('"', '\\"'),
        kwargs["geocode_match_quality"],
        kwargs["latitude_geocoded"],
        kwargs["longitude_geocoded"],
    )

    return update_crash_latlong_query


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

    final_address = (
        final_address.replace("None", "")
        .replace("null", "")
        .replace(" ,", ",")
        .replace("  ", " ")
        .strip()
    )

    return final_address


def is_faulty_street(street):
    """
    Returns true if the street contains any of the below strings
    :param street: string - The name of the string
    :return: bool
    """
    # If the street is empty, then it is faulty.
    if street == "" or street is None:
        return True

    list_of_bad_keywords = [
        "PARKING LOT",
        "NOT REPORTED",
        "PRIVATE ROAD",
    ]

    # If it contains the words NOT REPORTED
    for bad_keyword in list_of_bad_keywords:
        if bad_keyword in street:
            return True

    return False


def address_has_numbers(address):
    """
    Returns true if an address has a block number
    :param address: string - The address being evaluated
    :return: bool
    """
    return any(char.isdigit() for char in address)


def both_block_num_missing(record):
    """
    Returns true of both block numbers are missing
    :param record: dict - The record being evaluated
    :return: bool
    """
    rpt_block_num = record.get("rpt_block_num", "") or ""
    rpt_sec_block_num = record.get("rpt_sec_block_num", "") or ""

    # True, if neither address has a block number.
    if rpt_block_num == "" and rpt_sec_block_num == "":
        return True

    return False


def is_intersection(record):
    """
    Returns True if both streets have no block number.
    :param record: dict - The record being evaluated
    :return: bool
    """
    rpt_street_name = record.get("rpt_street_name", "") or ""
    rpt_sec_street_name = record.get("rpt_sec_street_name", "") or ""

    # If either street name is empty, return false
    if rpt_street_name == "" and rpt_sec_street_name == "":
        return False

    # True, if neither address has a block number.
    if both_block_num_missing(record):
        return True

    return False


def get_match_quality_here(response):
    """
    Returns the quality level from 0 to 1
    :param response: dict - The full response from Here
    :return: float
    """

    try:
        return response["Response"]["View"][0]["Result"][0]["Relevance"]
    except:
        return 0


def geocode_address_here(address):
    """
    Runs a geocode request against the Here API
    :param address: string - The address to pass to the Here endpoint.
    :return: string
    """

    # Build our parameters
    parameters = {
        "gen": "9",
        "prox": "30.268064,-97.742814,1000",
        "app_id": ATD_ETL_CONFIG["ATD_HERE_APP_ID"],
        "app_code": ATD_ETL_CONFIG["ATD_HERE_APP_CODE"],
        "mapview": ATD_ETL_CONFIG["ATD_HERE_BOUNDING_BOX"],
        "searchtext": address,
    }

    try:
        # Make request to API Endpoint
        return requests.get(
            ATD_ETL_CONFIG["ATD_HERE_API_ENDPOINT"], params=parameters
        ).json()
        # coordinates = request.json()['Response']['View'][0]['Result'][0]['Location']['DisplayPosition']
    except Exception as e:
        return {"error": str(e)}


def render_final_address(record):
    """
    Gets either a primary and secondary address, or returns nothing.
    :param record: dict - the record being evaluated
    :return: string
    """

    rpt_street_name = record.get("rpt_street_name", "") or ""
    rpt_sec_street_name = record.get("rpt_sec_street_name", "") or ""
    rpt_block_num = record.get("rpt_block_num", "") or ""
    rpt_sec_block_num = record.get("rpt_sec_block_num", "") or ""
    primary_addr = None
    secondary_addr = None

    # If we have enough to build a primary address, use that
    if rpt_block_num != "" and rpt_street_name != "":
        primary_addr = build_address(record=record, primary=True)

    # If we have enough to build a secondary address, use that
    if rpt_sec_block_num != "" and rpt_sec_street_name != "":
        secondary_addr = build_address(record=record, primary=False)

    return secondary_addr if is_faulty_street(primary_addr) else primary_addr


def remove_duplicates(address):
    """
    Removes duplicate prefix and postfixes from address string
    :param address: string - The address being evaluated
    :return: string
    """
    list_of_duplicates = {
        "N N": "N",
        "S S": "S",
        "E E": "E",
        "W W": "W",
        "DR DR": "DR",
        "LN LN": "LN",
        "ST ST": "ST",
        "RD RD": "RD",
        "BLVD BLVD": "BLVD",
        " ,": ",",
        "  ": " ",
    }

    for k, v in list_of_duplicates.items():
        address = address.replace(k, v).strip()

    return address


def get_coordinates_here(response):
    """
    Returns a tuple with the lat/long
    :param response: dict - The here response object
    :return: double, double
    """
    try:
        lat = response["Response"]["View"][0]["Result"][0]["Location"][
            "NavigationPosition"
        ][0]["Latitude"]
        long = response["Response"]["View"][0]["Result"][0]["Location"][
            "NavigationPosition"
        ][0]["Longitude"]
        return lat, long
    except:
        return 0, 0


def process_geocode_record(record):
    """
    This method will geocode a record and update it in the database
    :param record: dict - The record as it comes straight from hasura
    """

    crash_id = record["crash_id"]

    # First gather some data
    primary_address = build_address(record=record, primary=True)
    secondary_address = build_address(record=record, primary=False)
    is_intersection_response = False
    final_address = ""

    # If both are not addresses, then why proceed?
    if is_faulty_street(primary_address) and is_faulty_street(secondary_address):
        print(
            "[Error] Skipping geocode, both primary and secondary streets are faulty, crash_id: %s"
            % crash_id
        )
        return  # Nothing to do here

    # If either one of the streets is bad, then:
    if is_faulty_street(primary_address) or is_faulty_street(secondary_address):
        # It is not an intersection
        is_intersection_response = False

        # If both are missing the block number, then it will be a
        # wild guess by just having one street, skip this record.
        if both_block_num_missing(record):
            return  # Nothing to do here

    # Both addresses are ok
    is_intersection_response = is_intersection(record)

    # If it is an intersection (ie. both block numbers are missing) then:
    if is_intersection_response:
        final_address = "%s & %s" % (primary_address, secondary_address)

    # Not an intersection (one of the two block numbers is present)
    else:
        final_address = render_final_address(record)

    if final_address is None:
        print("No street could be found for crash_id: %s" % crash_id)
        return

    final_address += ", AUSTIN, TX"

    final_address = remove_duplicates(final_address)

    print(
        """
    ---------------------------------------------
    crash_id: %s
    primary_address: %s
    secondary_address: %s
    is_intersection: %s
    ---------------------------------------------
    final_address: %s
    ---------------------------------------------
    """
        % (
            crash_id,
            primary_address,
            secondary_address,
            is_intersection_response,
            final_address,
        )
    )

    # If it is not an intersection, and the final address does not have a block number, then skip
    if (
        is_intersection_response is False
        and address_has_numbers(final_address) is False
    ):
        print(
            "[Error] Skipping geocode, incomplete final address for crash_id: %s"
            % crash_id
        )
        return

    geocode_response = geocode_address_here(final_address)
    calculated_match_quality = get_match_quality_here(geocode_response)
    latitude, longitude = get_coordinates_here(geocode_response)

    if latitude == 0 or longitude == 0:
        print(
            "[Error] Skipping geocode, there are reported errors in the geocode for crash id: %s, error: %s"
            % (crash_id, json.dumps(geocode_response))
        )
        return

    mutation_query = update_record(
        crash_id=crash_id,
        geocode_date=today.strftime("%Y-%m-%d"),
        geocode_match_metadata=geocode_response,
        geocode_match_quality=calculated_match_quality,
        latitude_geocoded=latitude,
        longitude_geocoded=longitude,
    )

    print(mutation_query)

    run_query(mutation_query)
