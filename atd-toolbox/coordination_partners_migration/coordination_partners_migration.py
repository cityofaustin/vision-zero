import argparse
import requests

from secrets import HASURA_AUTH

def make_hasura_request(*, query, variables, env):
  """Fetch data from hasura
  Args:
    query (str): the hasura query
    env (str): the environment name, which will be used to acces secrets
  Raises:
    ValueError: If no data is returned
  Returns:
    dict: Hasura JSON response data
  """
  admin_secret = HASURA_AUTH["hasura_graphql_admin_secret"][env]
  endpoint = HASURA_AUTH["hasura_graphql_endpoint"][env]
  headers = {
    "X-Hasura-Admin-Secret": admin_secret,
    "content-type": "application/json",
  }
  payload = {"query": query, "variables": variables}
  res = requests.post(endpoint, json=payload, headers=headers)
  res.raise_for_status()
  data = res.json()
  try:
    return data["data"]
  except KeyError:
    raise ValueError(data)

RECOMMENDATIONS_QUERY = """
  query GetRecommendations {
    recommendations(where: {coordination_partner_id: {_is_null: false}}) {
      id
      coordination_partner_id
    }
  }
"""

RECOMMENDATIONS_PARTNER_INSERT = """
  mutation InsertRecommendationPartner(
    $recommendation_id: Int!,
    $partner_id: Int!
  ) {
    insert_recommendations_partners(objects: {
      recommendation_id: $recommendation_id
      partner_id: $partner_id
    }) {
      affected_rows
    }
  }
"""

def main(env):
  counts = 0
  # fetch all records that do not have a null value in the coordination_partner_id field
  data = make_hasura_request(query=RECOMMENDATIONS_QUERY, env=env, variables=None)
  recommendations = data["recommendations"]

  for rec in recommendations:

    recommendation_id = rec["id"]
    partner_id = rec["coordination_partner_id"]

    """ this mutation will:
    1. insert a record in the recommendations_partners table for every rec that has a coordination partner
    """
    make_hasura_request(
      query=RECOMMENDATIONS_PARTNER_INSERT,
      variables={
        "recommendation_id": recommendation_id,
        "partner_id": partner_id
      },
      env=env,
    )
    counts += 1
    print(counts)

  print(counts)

if __name__ == "__main__":
  parser = argparse.ArgumentParser()

  parser.add_argument(
    "-e",
    "--env",
    type=str,
    choices=["local", "staging", "prod"],
    default="staging",
    help=f"Environment",
  )

  args = parser.parse_args()

  main(args.env)