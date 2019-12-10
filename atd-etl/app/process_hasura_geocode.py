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
import requests
import os
import json
import web_pdb

from process.config import ATD_ETL_CONFIG
from process.helpers_hasura_geocode import *

# Start timer
start = time.time()


print("Hasura endpoint: '%s' " % ATD_ETL_CONFIG["HASURA_ENDPOINT"])
print("Here endpoint: '%s' " % ATD_ETL_CONFIG["ATD_HERE_API_ENDPOINT"])


records_to_geocode=get_geocode_list()


print("Records to be processed: ")

for record in records_to_geocode["data"]["atd_txdot_crashes"]:
    crash_id = record["crash_id"]
    
    primary_address = build_address(record=record, primary=True)
    secondary_address = build_address(record=record, primary=False)
    final_address = ""

    # Check if both streets are faulty
    if is_faulty_street(primary_address) and is_faulty_street(secondary_address):
        print("[Error] Skipping geocode, both primary and secondary streets are faulty, crash_id: %s" % crash_id)
        continue

    # If primary is bad, then check if we can use the second one.
    if is_faulty_street(primary_address):
        final_address = secondary_address

    # Otherwise, just use primary
    else:
        final_address = primary_address


    print("primary_address: %s" % primary_address)
    print("secondary_address: %s" % secondary_address)
    print("final_address: %s" % final_address)

    web_pdb.set_trace()

# Loop:
#   Until there aren't any more results:
#       1. Gather data from PostgreSQL (any records without lat-longs), limit to 10 records.
#       2. For each record:
#           - Check if the row has an address.
#           - GeoCode the address
#           - If there is GeoCode data, then make update to record in PostgreSQL


end = time.time()
hours, rem = divmod(end-start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours),int(minutes),seconds))
