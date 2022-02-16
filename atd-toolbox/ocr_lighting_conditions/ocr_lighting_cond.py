import os
import logging
import requests
import argparse

import boto3

# configure logging
logging.basicConfig()
log = logging.getLogger('CR3_download')
log.setLevel(logging.DEBUG)


argparse = argparse.ArgumentParser(description = 'A utility to OCR lighting conditions from CR3 files')
argparse.add_argument("-v", "--verbose",
    help = 'Be verbose about actions',
    required=False,
    action = 'store_true')
args = argparse.parse_args()

# get some environment variables to auth to S3
ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

query = """
query getCrashes($limit: Int!) {
  atd_txdot_crashes(limit: $limit, where: {ocr_light_cond_id: {_is_null: true}}) {
    crash_id
    light_cond_id
    ocr_light_cond_id
  }
}
"""

response = requests.post(
    url=os.getenv("GRAPHQL_ENDPOINT"),
    headers={
        "Accept": "*/*",
        "content-type": "application/json",
        "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_KEY")
        },
    json={
        "query": query,
        "variables": {
            "limit": 10
            }
        }
    )

print(response)
for crash in response.json()['data']['atd_txdot_crashes']:
    print(crash)