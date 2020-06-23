#
# Resolves the location for a crash.
#

import json
import requests
import time
import os
from string import Template

HASURA_ADMIN_SECRET = os.getenv("HASURA_ADMIN_SECRET", "")
HASURA_ENDPOINT = os.getenv("HASURA_ENDPOINT", "")


def hasura_request(record):
    """
    Processes a location update event.
    :param dict data: The json payload from Hasura
    """
    # Get data/crash_id from Hasura Event request

    print("Handling request: ")
    print(json.dumps(record))

    try:
        data = json.loads(record)
    except:
        data = ""
        exit(0)

    try:
        crash_id = data["event"]["data"]["old"]["crash_id"]
        old_jurisdiction_flag = data["event"]["data"]["old"]["austin_full_purpose"]
    except:
        print(
            json.dumps(
                {
                    "message": "Unable to parse request body to identify a Location Record"
                }
            )
        )

    print("Crash ID: " + str(crash_id))

    # Prep Hasura query
    HEADERS = {
        "Content-Type": "application/json",
        "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET,
    }

    find_location_query = """
        query($crash_id:Int) {
            find_crash_in_jurisdiction(args: {jurisdiction_id: 11, given_crash_id: $crash_id}) {
                crash_id
                austin_full_purpose
            }
        }
    """

    query_variables = {
        "crash_id": crash_id
    }

    json_body = {
        "query": find_location_query,
        "variables": query_variables,
    }

    # Make request to Hasura expecting a Location Record in the response
    try:
        response = requests.post(
            HASURA_ENDPOINT, data=json.dumps(json_body), headers=HEADERS
        )
    except:
        print(
            json.dumps(
                {
                    "message": "Unable to parse request body to check for crash containment in jurisdiction"
                }
            )
        )

    is_within_jurisdiction = len(response.json()["data"]["find_crash_in_jurisdiction"])

    # We're casting a varchar here into a boolean, so I'm declaring Y to be True and everything else to be False.
    if (not (old_jurisdiction_flag == "Y") and not is_within_jurisdiction) or (
        old_jurisdiction_flag == "Y" and is_within_jurisdiction
    ):
        print(json.dumps({"message": "Success. austin_full_purpose is up to date"}))
    else:
        # Prep the mutation
        update_jurisdiction_flag_mutation = """
                mutation updateCrashJurisdiction($crashId: Int!, $jurisdictionFlag: String!) {
                    update_atd_txdot_crashes(where: {crash_id: {_eq: $crashId}}, _set: {austin_full_purpose: $jurisdictionFlag}) {
                        affected_rows
                    }
                }
            """

        query_variables = {
            "crashId": crash_id,
            "jurisdictionFlag": "Y" if is_within_jurisdiction else "N",
        }
        mutation_json_body = {
            "query": update_jurisdiction_flag_mutation,
            "variables": query_variables,
        }

        # Execute the mutation
        try:
            mutation_response = requests.post(
                HASURA_ENDPOINT, data=json.dumps(mutation_json_body), headers=HEADERS
            )
        except:
            mutation_response = {}
            print(
                json.dumps(
                    {"message": "Unable to parse request body for jurisdiction update"}
                )
            )

        print("Mutation Successful")
        print(mutation_response.json())


def handler(event, context):
    """
    Event handler main loop. It handles a single or multiple SQS messages.
    :param dict event: One or many SQS messages
    :param dict context: Event context
    """
    for record in event["Records"]:
        timeStr = time.ctime()
        print("Current Timestamp : ", timeStr)
        print(json.dumps(record))
        if "body" in record:
            hasura_request(record["body"])
        timeStr = time.ctime()
        print("Done executing: ", timeStr)
