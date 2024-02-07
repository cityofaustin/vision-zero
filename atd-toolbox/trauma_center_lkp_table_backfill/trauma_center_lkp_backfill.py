"""Backfills the near trauma center lookup table."""

import argparse
import requests
from datetime import datetime
import pandas as pd

from env import HASURA_AUTH

def parse_csv():
  df = pd.read_csv('trauma_centers_lkp.csv')
  return df

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

TRAUMA_CENTER_LKP_INSERT = """
  mutation InsertTraumaCenterLkp(
    $near_trauma_center_id: Int!,
    $near_trauma_center_desc: String!
  ) {
    insert_atd_txdot__trauma_center_lkp(objects: {
      near_trauma_center_id: $near_trauma_center_id
      near_trauma_center_desc: $near_trauma_center_desc
    }) {
      affected_rows
    }
  }
"""

def main(env):
  counts = 0
  df = parse_csv()

  for index, row in df.iterrows():
    near_trauma_center_id = row['ID']
    near_trauma_center_desc = row['Description']
    make_hasura_request(
      query=TRAUMA_CENTER_LKP_INSERT,
      variables={
        "near_trauma_center_id": near_trauma_center_id,
        "near_trauma_center_desc": near_trauma_center_desc,
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