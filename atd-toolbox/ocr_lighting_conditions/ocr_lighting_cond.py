import os
import sys
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

print(args)

s3 = boto3.client('s3')

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

    # build url and download the CR3
    #if (args.v):
        #print('Pulling CR3 PDF from S3');
    key =  os.getenv("CR3_PATH") + '/' + str(crash['crash_id']) + '.pdf'
    print(key)
    obj = []
    try:
        pdf = s3.get_object(Bucket=os.getenv("CR3_BUCKET"), Key=key)
    except:
        sys.stderr.write("Error: Failed to get PDF from the S3 object\n")
        continue
