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
# import agolutil
import concurrent.futures
import web_pdb
from process.request import run_query
from string import Template


from datetime import datetime


start_time = datetime.now()


query = """
    mutation MakeMutation($locationId:String, $crashId:Int){
      insert_atd_txdot_crash_locations(objects: {
        location_id: $locationId,
        crash_id: $crashId}) {
        affected_rows
      }
    }
"""

noncr3_query = """
    query getNonCR3Collision {
        atd_apd_blueform(limit: 200, offset: 200)  {
            address
            hour
            latitude
            longitude
            call_num
            date
            form_id
        }
    }
"""

find_location_query = Template("""
query findLocation {
    find_location_for_noncr3_collision(args: {id: $id}) {
        description
        unique_id
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

# web_pdb.set_trace()

# Query for a list of Non-CR3 Collisions
result = run_query(noncr3_query)
non_CR3_collisions_array = result['data']['atd_apd_blueform']

# Loop over each record
for collision in non_CR3_collisions_array:
    print("Processing NON CR3 RECORD: '%s' " % collision["form_id"])
    collision_query = find_location_query.substitute(id=collision["form_id"])

    # Query to see if the record has a matching Location
    # using findLocation SQL function
    location_result = run_query(collision_query)
    location = location_result['data']['find_location_for_noncr3_collision']

    # If there is a matching location...
    if location:
        location_id = location[0]['unique_id']
        location_desc = location[0]['description']
        non_cr3_mutation = update_record_noncr3.substitute(
            id=collision["form_id"], location_id=location_id)
        # ...run a mutation on the collision and update its location_id
        mutation_result = run_query(non_cr3_mutation)
        print(mutation_result)

end_time = datetime.now()
print('Duration: {}'.format(end_time - start_time))
