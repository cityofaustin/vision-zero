#
# Request Helper - Makes post requests to a Hasura/GraphQL endpoint.
#
import requests
from .config import ATD_ETL_CONFIG


def run_query(query):
    """
    Runs a GraphQL query against Hasura via an HTTP POST request.
    :param query: string - The GraphQL query to execute (query, mutation, etc.)
    :return: object - A Json dictionary directly from Hasura
    """
    # Build Header with Admin Secret
    headers = {
        "x-hasura-admin-secret": ATD_ETL_CONFIG["HASURA_ADMIN_KEY"]
    }

    # Try making the request via POST
    try:
        return requests.post(ATD_ETL_CONFIG["HASURA_ENDPOINT"],
                             json={'query': query},
                             headers=headers).json()
    except Exception as e:
        print("Exception, could not insert: " + str(e))
        print("Query: '%s'" % query)
        return None
