#!/usr/bin/env python
"""
Hasura - Non-CR3 Collision to Location Association
Author: Austin Transportation Department, Data and Technology Services
Description: This script searches through the non-CR3 collisions table (through
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

find_noncr3_collisions_for_location_query = Template("""
query nonCR3LocationsByLocation {
    find_noncr3_collisions_for_location(args: {id: "$id"}) {
        address
        hour
        latitude
        location_id
        longitude
        form_id
    }
}
""")

update_record_noncr3 = Template("""
    mutation CrashesUpdateRecordNonCR3 {
        update_atd_apd_blueform(where: {form_id: {_eq: $id}}, _set: {location_id: "$location_id"}) {
        affected_rows
        }
    }
""")

#
# This method requests all the Locations in the atd_txdot_locations table and loops through each one.
# During each iteration of the loop, it gets all the collisions that have coordinates inside its polygon.
# It then loops through each non CR3 record and assigns a Location ID to the nonCR3 collison's "location_id"
# if it doesn't have an exisiting Location ID assignement.
#


def add_locations_to_non_cr3s_by_location():
    result = run_query(locations_query)
    locations = result['data']['atd_txdot_locations']

    # Loop over each location
    for idx, location in enumerate(locations):

        # Using findNonCR3crashesForLocation SQL function, get all the nonCR3s whose coordinates are
        # inside the location polygon
        collisions_query = find_noncr3_collisions_for_location_query.substitute(
            id=location['location_id'])

        collisions_result = run_query(collisions_query)

        print(collisions_result)

        collisions_array = collisions_result['data']['find_noncr3_collisions_for_location']

        print("Processing LOCATION ID: {}. {} NON CR3s found.".format(
            location["location_id"], len(collisions_array)))
        print("{} of {} Locations".format(idx + 1, len(locations)))

        # Loop through the values and update their location ID
        for collision in collisions_array:
            non_cr3_mutation = update_record_noncr3.substitute(
                id=collision["form_id"], location_id=location["location_id"])
            mutation_result = run_query(non_cr3_mutation)
            print(mutation_result)


add_locations_to_non_cr3s_by_location()

end_time = datetime.now()
print('Duration: {}'.format(end_time - start_time))
