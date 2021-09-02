import re
import os
import sys
import json
import argparse
import logging

import requests

logging.basicConfig()
log = logging.getLogger('crashmove')
log.setLevel(logging.DEBUG)

HASURA_ADMIN_KEY = os.getenv('HASURA_ADMIN_KEY')
HASURA_ENDPOINT = os.getenv('HASURA_ENDPOINT')

HEADERS = {
          "X-Hasura-Admin-Secret": HASURA_ADMIN_KEY,
          "Content-Type": "application/json",
          }


# setup and parse arguments
try:
    argparse = argparse.ArgumentParser(description = 'Utility to move crashes to service road polygon centroids')

    argparse.add_argument("-p", "--production",
            help = 'Specify the use of production environment',
            action = 'store_true')

    argparse.add_argument("--i-understand",
            help = 'Do not ask the user to acknoledge that this program changes the state of S3 objects and the database.',
            action = 'store_true')


    args = argparse.parse_args()
except Exception as e:
    # a stderr log is not needed, argparse croaks verbosly
    sys.exit(1)

# This program will change the state of S3 objects.  Make sure the user is OK with what is about to happen.
try:
    if not args.i_understand:
        # these do not use the logging functionality to avoid the timestamp on each and increase readability
        print('')
        print("This program update crash positions.")
        print('')
        print("It will move crashes from level 5 centerlines to the centroids")
        print("of locations which are believed to better geolocate that crash.")
        print('')
        print("Please type 'I understand' to continue.")
        print('')
        ack = input()
        assert(re.match("^i understand$", ack, re.I))
except Exception as e:
    log.error("User acknoledgement failed.")
    log.debug(str(e))
    sys.exit(1)


# verify that environment Hasura variables were available and have populated values
try:
    assert(HASURA_ADMIN_KEY is not None and HASURA_ENDPOINT is not None)
except Exception as e:
    log.error("Please set environment variables HASURA_ADMIN_KEY and HASURA_ENDPOINT")
    sys.exit(1)


# sanity check the provided hasura endpoint and the assertion from the user about staging/production
if (args.production):
    try:
        assert(not re.search("staging", HASURA_ENDPOINT, re.I))
    except Exception as e:
        log.error("Production flag used but staging appears in the Hasura endpoint URL")
        sys.exit(1)
else:
    try:
        assert(re.search("staging", HASURA_ENDPOINT, re.I))
    except Exception as e:
        log.error("Production flag is not used and staging doesn't appear in the Hasura endpoint URL")
        sys.exit(1)




try:
    # graphql query to get current cr3_file_metadata
    get_crashes = """
    query get_crashes_to_move {
      cr3_nonproper_crashes_on_mainlane(where: {surface_street_polygon: {_is_null: false}}) {
        crash_id
        }
      }
    """
    # get the metadata as a dict or None if null in DB
    crashes = requests.post(HASURA_ENDPOINT, headers = HEADERS, data = json.dumps(
        {
        "query": get_crashes,
        "variables": { }
        })).json()['data']#['atd_txdot_crashes'][0]['cr3_file_metadata']

except Exception as e:
    log.error("Request to get crashes to move failed.")
    log.debug(str(e))
    sys.exit(1)

print(crashes)

