import os
import json
import requests

HASURA_ENDPOINT = os.getenv("HASURA_ENDPOINT")
HASURA_ADMIN_KEY = os.getenv("HASURA_ADMIN_KEY")

def run_query(query):
    
    # Build Header with Admin Secret
    headers = {"x-hasura-admin-secret": HASURA_ADMIN_KEY}

    # Try making insertion
    try:
        return requests.post(HASURA_ENDPOINT,
                             json={'query': query},
                             headers=headers).json()
    except Exception as e:
        print("Exception, could not insert: " + str(e))
        print("Query: '%s'" % query)
        return None