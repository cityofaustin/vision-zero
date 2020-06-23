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

# Query to gather a subset of list of specific Locations
subset_locations_query = Template("""
    query getLocations {
        atd_txdot_locations(where: {location_id: {_in: $locations_list}}) {
            location_id
            description
        }
    }
""")

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

bulk_update_record_cr3 = Template("""
    mutation CrashesBulkUpdateRecordCR3 {
        update_atd_txdot_crashes(where: {crash_id: {_in: $crash_id_array}}, _set: {location_id: "$location_id"}) {
            affected_rows
        }
    }
""")

bulk_nullify_location_for_CR3 = Template("""
    mutation CrashesBulkUpdateRecordCR3 {
        update_atd_txdot_crashes(where: {crash_id: {_in: $crash_id_array}}, _set: {location_id: null}) {
            affected_rows
        }
    }
""")


find_existing_crashes_by_location = Template("""
    {
        atd_txdot_crashes(where: {location_id: {_eq: "$location_id"}}){
            crash_id
            location_id
        }
    }
""")

#
# This method requests all the Locations in the atd_txdot_locations table and loops through each one.
# During each iteration of the loop, it gets all the collisions that have coordinates inside its polygon.
# It then loops through each CR3 record and assigns a Location ID to the CR3 collison's "location_id"
# if it doesn't have an existing Location ID assignment.
#


def add_locations_to_cr3s_by_location(locations_list="", starting_index=0):
    if len(locations_list) > 0:
        subset_locations_query_template = subset_locations_query.substitute(
            locations_list=locations_list
        )
        result = run_query(subset_locations_query_template)
    else:
        result = run_query(locations_query)

    all_locations = result['data']['atd_txdot_locations']

    locations = all_locations[starting_index:]

    # Loop over each location
    for idx, location in enumerate(locations):
        # Start by finding existing locations associations and nulling them out
        # for each location
        existing_related_query = find_existing_crashes_by_location.substitute(
            location_id=location['location_id'])

        # Get crashes related to location & restructure into a list
        existing_related_response = run_query(existing_related_query)
        crashes_to_nullify_location = [crash['crash_id']
                                       for crash in existing_related_response["data"]["atd_txdot_crashes"]]

        # If there are crashes to nullify...
        if len(crashes_to_nullify_location) > 0:
            # Set up mutation template with list of crashes
            bulk_location_nullify_template = bulk_nullify_location_for_CR3.substitute(
                crash_id_array=crashes_to_nullify_location)

            # NULLIFY!
            nullify_response = run_query(bulk_location_nullify_template)
            print(
                f'Nulling {len(crashes_to_nullify_location)} Crash Records for Location {location["location_id"]}:')
            print(nullify_response)

        # Using findCR3crashesForLocation SQL function, get all the CR3s whose coordinates are
        # inside the location polygon
        print("{} of {} Locations".format(idx + 1, len(locations)))
        collisions_query = find_cr3_collisions_for_location_query.substitute(
            id=location['location_id'])

        collisions_result = run_query(collisions_query)
        collisions_list = collisions_result['data']['find_cr3_collisions_for_location']

        print("Processing LOCATION ID: {}. {} CR3s found.".format(
            location["location_id"], len(collisions_list)))

        if len(collisions_list) > 0:
            # Make a list of crash_ids to update
            collisions_to_update_location_id = [
                crash['crash_id'] for crash in collisions_list]

            # Setup mutation template
            cr3_mutation = bulk_update_record_cr3.substitute(
                crash_id_array=collisions_to_update_location_id,
                location_id=f"{location['location_id']}"
            )

            # MUTATE!!!
            mutation_result = run_query(cr3_mutation)
            print(mutation_result)


locations_subset_string = '["11B50D803D","578B8C4DC1","0582C8E4E5","36DB763FF4","A00F3C3651","992AD76767","963EAF2062","988417B187","A7624DC531","C52D0C9A20","AA73DD1C73","3737D9BD3C","1DD7F33454","10C010652B","C68D24B3AC","9C5F858027","9403E4B5DE","D7B34694BD","47FD9C3157","18DB893A66","111A4271F1","018FE9BAA5","1CFB1C8ADB","684BE617BD","284D44F97D","096B85FE28","3D74E9A731","11B50D803D","578B8C4DC1","0582C8E4E5","36DB763FF4","A00F3C3651","992AD76767","963EAF2062","988417B187","A7624DC531","C52D0C9A20","AA73DD1C73","3737D9BD3C","1DD7F33454","10C010652B","C68D24B3AC","9C5F858027","9403E4B5DE","D7B34694BD","47FD9C3157","18DB893A66","111A4271F1","018FE9BAA5","1CFB1C8ADB","684BE617BD","284D44F97D","096B85FE28","3D74E9A731"]'


starting_index = 0

# Pass `locations_subset_string` as first argument for subset location processing
add_locations_to_cr3s_by_location(locations_subset_string, starting_index)

end_time = datetime.now()
print('Duration: {}'.format(end_time - start_time))
