import os
import json
import requests
from sodapy import Socrata

HASURA_ENDPOINT = ""
HASURA_ADMIN_KEY = ""

# Hasura


def run_query(query):

    # Build Header with Admin Secret
    headers = {
        "x-hasura-admin-secret": HASURA_ADMIN_KEY
    }

   # Try making insertion
    try:
        return requests.post(HASURA_ENDPOINT,
                             json={'query': query},
                             headers=headers).json()
    except Exception as e:
        print("Exception, could not insert: " + str(e))
        print("Query: '%s'" % query)
        return None


crashes_query = """
    query getCrashesSocrata {
        atd_txdot_crashes (limit: 2) {
            crash_id
    		crash_fatal_fl
            crash_date
            crash_time
            case_id
            rpt_latitude
            rpt_longitude
            rpt_block_num
            rpt_street_pfx
            rpt_street_name
            rpt_street_sfx
            crash_speed_limit
            road_constr_zone_fl
            latitude
            longitude
            street_name
            street_nbr
            street_name_2
            street_nbr_2
            crash_sev_id
            sus_serious_injry_cnt
            nonincap_injry_cnt
            poss_injry_cnt
            non_injry_cnt
            unkn_injry_cnt
            tot_injry_cnt
            death_cnt
        }
    }  
"""

persons_query = """
    query PersonsQuery {
        atd_txdot_person(limit: 1, where: {_or: [{prsn_injry_sev_id: {_eq: 1}}, {prsn_injry_sev_id: {_eq: 4}}], _and: {crash: {city_id: {_eq: 22}}}}) {
            prsn_injry_sev_id
            prsn_age
            prsn_gndr_id
            crash {
                crash_date
            }
        }
        atd_txdot_primaryperson(limit: 1, where: {_or: [{prsn_injry_sev_id: {_eq: 1}}, {prsn_injry_sev_id: {_eq: 4}}], _and: {crash: {city_id: {_eq: 22}}}}) {
            prsn_injry_sev_id
            prsn_age
            prsn_gndr_id
            drvr_zip
            crash {
                crash_date
            }
        }
    }
"""

persons = run_query(persons_query)
person_data = persons['data']['atd_txdot_person']
primary_person_data = persons['data']['atd_txdot_primaryperson']


print("\nPerson Data")
print("-----------")
for record in person_data:
    for k, v in record.items():
        print(str(k) + " " + str(v))
    print("\n")
print("\nPrimary Person Data")
print("-------------------")
for record in primary_person_data:
    for k, v in record.items():
        print(str(k) + " " + str(v))
    print("\n")

crashes = run_query(crashes_query)
crash_data = crashes['data']['atd_txdot_crashes']
print("\nCrash Data")
print("----------")
for record in crash_data:
    for k, v in record.items():
        print(str(k) + " " + str(v))
    print("\n")

# sodapy
client = Socrata("data.austintexas.gov", None)

result = client.get("y2wy-tgr5", limit=2)

client.close()

print("\n")
print(result)
