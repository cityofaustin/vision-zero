#!/usr/bin/env python
"""
Hasura - Non-CR3 Collision to Location Association
Author: Austin Transportation Department, Data and Technology Services
Description: This script searches through the crashes table (through
Hasura) in Postgres, for any crashes that do not have a location
assigned. If the crash cannot be associated to a location, then it
should skip it. Crashes with fatalities and serious injuries should
take priority.
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

from process.config import ATD_ETL_CONFIG

from datetime import datetime


start_time = datetime.now()

config = {
    "service_name": "intersection_polygons_test",
    "layer_id": "0"
}

geojson = {
    "type": "FeatureCollection",
    "features": []
}

templateFeature = {
    "type": "Feature",
    "location": "",
    "geometry": {
        "type": "Point",
        "coordinates": [0, 0]
    },
    "properties": {
        "icon": "car",
        "marker-color": "#f00",
        "stroke": "#eb4034"
    }
}

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
        atd_apd_blueform(limit: 100)  {
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

headers = {
    "content-type": "application/json",
    "x-hasura-admin-secret": "aeMW9z75MtdK49tvFii56U9M78AcRdfK42aFpRHxZza4eAgcs53tSNg9K42rfUW2"
}

url = "https://vzd-staging.austinmobility.io/v1/graphql"

print("Endpoint: %s" % ATD_ETL_CONFIG["HASURA_ENDPOINT"])

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
# foo = update_record_noncr3.substitute(id=1, location_id=999)
# print(foo)

result = run_query(noncr3_query)
non_CR3_collisions_array = result['data']['atd_apd_blueform']
for collision in non_CR3_collisions_array:
    print("Processing NON CR3 RECORD: '%s' " % collision["form_id"])
    collision_query = find_location_query.substitute(id=collision["form_id"])
    location_result = run_query(collision_query)
    record = location_result['data']['find_location_for_noncr3_collision']
    if record:
        location_id = record[0]['unique_id']
        print(type(location_id))
        location_desc = record[0]['description']
        non_cr3_mutation = update_record_noncr3.substitute(
            id=collision["form_id"], location_id=location_id)
        mutation_result = run_query(non_cr3_mutation)
        print(mutation_result)

# def request_noncr3_locations(query, url, headers):
#     """
#     Request non-CR3 crashes from VZD.
#     """
#     request = requests.get(
#         url, json={'query': query}, headers=headers)
#     print(request)
#     web_pdb.set_trace()
#     if request.status_code == 200:
#         return request.json()
#     else:
#         print(request)
#         web_pdb.set_trace()
#         raise Exception("non-CR3 request query failed to run by returning code of {}. {}".format(
#             request.status_code, query))

# request_noncr3_locations(noncr3_query, url, headers)


def make_query(query, variables, url, headers):
    """
    Make query response
    """
    request = requests.post(
        url, json={'query': query, 'variables': variables}, headers=headers)
    if request.status_code == 200:
        return request.json()
    else:
        raise Exception("Query failed to run by returning code of {}. {}".format(
            request.status_code, query))


def find_location(longitude, latitude):
    params = {
        "f": "json",
        "outFields": "*",
        "geometry": "%s,%s" % (longitude, latitude),
        "geomtryType": "esriGeometryPoint",
        "returnGeometry": False,
        "spatialRel": "esriSpatialRelIntersects",
        "inSR": 4326,
        "geometryType": "esriGeometryPoint",
        "distance": None,
        "units": None,
    }

    try:
        intersectionData = agolutil.point_in_poly(
            config['service_name'], config['layer_id'], params)
        intersectionId = intersectionData['features'][0]['attributes']['INTERSECTION_ID']
        return intersectionId
    except Exception as e:
        print("Error: %s" % str(e))
        return None


def build_feature(long, lat):
    """
    Copies and builds a GeoJson entry from template (above).
    :param long:
    :param lat:
    :return:
    """
    output = copy.deepcopy(templateFeature)
    output['geometry']['coordinates'] = [long, lat]
    return output


#
# This
#
def add_feature(feature):
    """
    This function will add a feature to the final GeoJson object.
    :param feature:
    :return:
    """
    geojson['features'].append(feature)


#
# This function is passed to the thread pool executor and
# will process a single crash item object.
#
def process_crash(item):
    """
    The crash item that contains the longitude and latitude
    :param item:
    :return:
    """

    crash = build_feature(item['longitude'], item['latitude'])
    location_id = find_location(item['longitude'], item['latitude'])

    variables = {
        "locationId": str(location_id),
        "crashId": item['crash_id']
    }

    req = make_query(url=url, headers=headers,
                     query=query, variables=variables)

    crash['mutation'] = req

    if location_id is None:
        crash['location'] = str(location_id)
        crash['properties']['stroke'] = '#0b6fd4'
    else:
        crash['location'] = "None"
        crash['properties']['stroke'] = '#eb4034'

    add_feature(crash)


# call a method to request Hasura data


#
# Setting up a concurrency of 10 max_threads, that should be enough.
# We will need to test how much more ESRI will allow us to run reliably.
#
# with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
#     executor.map(process_crash, crash_data['data']['atd_txdot_crashes'])

print(json.dumps(geojson))

end_time = datetime.now()
print('Duration: {}'.format(end_time - start_time))
