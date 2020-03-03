#!/usr/bin/env python
"""
Hasura - CR3 Collision to Location Association
Author: Austin Transportation Department, Data and Technology Services
Description: This script searches through the CR3 collisions table (through
Hasura) in Postgres, for any crashes that do not have a location
assigned. If the crash cannot be associated to a location, then it
should skip it. 
Note: This script should run always in the background at a
proper interval.
The application requires the requests library:
    https://pypi.org/project/requests/
"""
import json
import copy
import requests
import concurrent.futures
from process.request import run_query
from string import Template


from datetime import datetime


start_time = datetime.now()

# Query to gather a list of all Locations
locations_query = """
    query getLocations {
        atd_txdot_locations {
            location_id
            description
        }
    }
"""

find_cr3_collisions_for_location_query = Template("""
query cr3LocationsByLocation {
  find_cr3_collisions_for_location(args: {id: "$id"}) {
    latitude_primary
    longitude_primary
    location_id
    crash_id
  }
}
""")

update_record_cr3 = Template("""
    mutation CrashesUpdateRecordCR3 {
        update_atd_txdot_crashes(where: {crash_id: {_eq: $id}}, _set: {location_id: "$location_id"}) {
        affected_rows
        }
    }
""")

#
# This method requests all the Locations in the atd_txdot_locations table and loops through each one.
# During each iteration of the loop, it gets all the collisions that have coordinates inside its polygon.
# It then loops through each CR3 record and assigns a Location ID to the CR3 collison's "location_id"
# if it doesn't have an existing Location ID assignment.
#


def add_locations_to_cr3s_by_location():
    result = run_query(locations_query)
    locations = result['data']['atd_txdot_locations']

    # Loop over each location
    for location in locations:

        # Using findCR3crashesForLocation SQL function, get all the CR3s whose coordinates are
        # inside the location polygon
        collisions_query = find_cr3_collisions_for_location_query.substitute(
            id=location['location_id'])

        collisions_result = run_query(collisions_query)

        collisions_array = collisions_result['data']['find_cr3_collisions_for_location']

        print("Processing LOCATION ID: {}. {} CR3s found.".format(
            location["location_id"], len(collisions_array)))

        # Loop through the values and update their location ID
        for collision in collisions_array:
            # # Skip if there is already an associated record.
            # if collision['location_id']:
            #     continue
            cr3_mutation = update_record_cr3.substitute(
                id=collision["crash_id"], location_id=location["location_id"])
            mutation_result = run_query(cr3_mutation)
            print(mutation_result)


add_locations_to_cr3s_by_location()

end_time = datetime.now()
print('Duration: {}'.format(end_time - start_time))
