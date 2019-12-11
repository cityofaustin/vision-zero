#!/usr/bin/env python
"""
Process - GeoCoder
Author: Austin Transportation Department, Data and Technology Services

Description: The purpose of this script is to find records that do not have
latitude/longitude coordinates and based on pre-determined business logic.
The accuracy of the geocoder is contingent on the quality of the addresses
provided in the data; therefore, data refining needs to be a priority for
when designing business logic or philosophy.

The application requires the requests library:
    https://pypi.org/project/requests/
"""
import time
import datetime
import requests
import os
import json
import web_pdb

from process.config import ATD_ETL_CONFIG
from process.helpers_hasura_geocode import *

# Start timer
start = time.time()
# Today
today = datetime.date.today()

print("Hasura endpoint: '%s' " % ATD_ETL_CONFIG["HASURA_ENDPOINT"])
print("Here endpoint: '%s' " % ATD_ETL_CONFIG["ATD_HERE_API_ENDPOINT"])


records_to_geocode = get_geocode_list()


print("Records to be processed: ")

for record in records_to_geocode["data"]["atd_txdot_crashes"]:
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
        continue

    # If either one of the streets is bad, then:
    if is_faulty_street(primary_address) or is_faulty_street(secondary_address):
        # It is not an intersection
        is_intersection_response = False

        # If both are missing the block number, then it will be a
        # wild guess by just having one street, skip this record.
        if both_block_num_missing(record):
            continue  # Nothing to do here


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
        continue

    final_address += ", AUSTIN, TX"

    final_address = remove_duplicates(final_address)

    print("---------------------------------------------")
    print("crash_id: %s" % crash_id)
    print("primary_address: %s" % primary_address)
    print("secondary_address: %s" % secondary_address)
    print("is_intersection: %s" % is_intersection_response)
    print("---------------------------------------------")
    print("final_address: %s" % final_address)
    print("---------------------------------------------")

    # If it is not an intersection, and the final address does not have a block number, then skip
    if (
        is_intersection_response is False
        and address_has_numbers(final_address) is False
    ):
        print(
            "[Error] Skipping geocode, incomplete final address for crash_id: %s"
            % crash_id
        )
        continue

    geocode_response = geocode_address_here(final_address)
    clean_response = clean_geocode_response_here(geocode_response)
    calculated_match_quality = get_match_quality_here(geocode_response)

    print("Match Quality: %s" % calculated_match_quality)
    print("Clean Response: %s" % (json.dumps(clean_response)))

    web_pdb.set_trace()

    mutation_query = update_record(
        crash_id=crash_id,
        geocode_date=today.strftime("%Y-%m-%d"),
        geocode_match_metadata=geocode_response,
        geocode_match_quality="1",
        latitude_geocoded=12.12,
        longitude_geocoded=13.13,
    )

# Loop:
#   Until there aren't any more results:
#       1. Gather data from PostgreSQL (any records without lat-longs), limit to 10 records.
#       2. For each record:
#           - Check if the row has an address.
#           - GeoCode the address
#           - If there is GeoCode data, then make update to record in PostgreSQL


end = time.time()
hours, rem = divmod(end - start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds))
