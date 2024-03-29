#!/usr/bin/env python
"""
CRIS - CR3 Downloader
Author: Austin Transportation Department, Data and Technology Services

Description: This script allows the user to log in to the CRIS website
and download CR3 pdf files as needed. The list of CR3 files to be downloaded
is obtained from Hasura, and it is made up of the records that do not have
any CR3 files associated.
"""

import os
import time
import json
from concurrent.futures import ThreadPoolExecutor

from process.helpers_cr3 import *

from onepasswordconnectsdk.client import Client, new_client
import onepasswordconnectsdk


# Start timer
start = time.time()


# Get 1Password secrets from environment
ONEPASSWORD_CONNECT_HOST = os.getenv("OP_CONNECT")
ONEPASSWORD_CONNECT_TOKEN = os.getenv("OP_API_TOKEN")
VAULT_ID = os.getenv("OP_VAULT_ID")

# Setup 1Password server connection
one_password_client = new_client(ONEPASSWORD_CONNECT_HOST, ONEPASSWORD_CONNECT_TOKEN)

# Get secrets from 1Password
REQUIRED_SECRETS = {
    "HASURA_ENDPOINT": {
        "opitem": "Vision Zero graphql-engine Endpoints",
        "opfield": "production.GraphQL Endpoint",
        "opvault": VAULT_ID,
    },
    "HASURA_ADMIN_KEY": {
        "opitem": "Vision Zero graphql-engine Endpoints",
        "opfield": "production.Admin Key",
        "opvault": VAULT_ID,
    },
    "AWS_ACCESS_KEY_ID": {
        "opitem": "CR3 Download IAM Access Key and Secret",
        "opfield": "production.accessKeyId",
        "opvault": VAULT_ID,
    },
    "AWS_SECRET_ACCESS_KEY": {
        "opitem": "CR3 Download IAM Access Key and Secret",
        "opfield": "production.accessSecret",
        "opvault": VAULT_ID,
    },
    "AWS_DEFAULT_REGION": {
        "opitem": "CR3 Download IAM Access Key and Secret",
        "opfield": "production.awsDefaultRegion",
        "opvault": VAULT_ID,
    },
    "ATD_CRIS_CR3_URL": {
        "opitem": "Vision Zero CRIS CR3 Download",
        "opfield": "production.ATD_CRIS_CR3_URL",
        "opvault": VAULT_ID,
    },
    "AWS_CRIS_CR3_BUCKET_NAME": {
        "opitem": "Vision Zero CRIS CR3 Download",
        "opfield": "production.AWS_CRIS_CR3_BUCKET_NAME",
        "opvault": VAULT_ID,
    },
    "AWS_CRIS_CR3_BUCKET_PATH": {
        "opitem": "Vision Zero CRIS CR3 Download",
        "opfield": "production.AWS_CRIS_CR3_BUCKET_PATH",
        "opvault": VAULT_ID,
    },
}

env_vars = onepasswordconnectsdk.load_dict(one_password_client, REQUIRED_SECRETS)

# Set secrets from 1Password in environment
for key, value in env_vars.items():
    os.environ[key] = value

#
# We now need to request a list of N number of records
# that do not have a CR3. For each record we must download
# the CR3 pdf, upload to S3
#

# # ask user for a set of valid cookies for requests to the CRIS website
CRIS_BROWSER_COOKIES = input(
    "Please login to CRIS and extract the contents of the Cookie: header and please paste it here:"
)

print("Preparing download loop.")

print("Gathering list of crashes.")
# Track crash IDs that we don't successfully retrieve a pdf file for
skipped_uploads_and_updates = []

# Some crash IDs were manually added at the request of the VZ team so
# CR3s for these crash IDs are not available in the CRIS database.
# We can skip requesting them.
# See https://github.com/cityofaustin/atd-data-tech/issues/9786
known_skips = [180290542, 144720068]

crashes_list_without_skips = []

try:
    print("Hasura endpoint: '%s' " % os.getenv("HASURA_ENDPOINT"))

    response = get_crash_id_list()
    # print("\nResponse from Hasura: %s" % json.dumps(response))

    crashes_list = response["data"]["atd_txdot_crashes"]

    crashes_list_without_skips = [
        x for x in crashes_list if x["crash_id"] not in known_skips
    ]


except Exception as e:
    crashes_list_without_skips = []
    print("Error, could not run CR3 processing: " + str(e))


print(f"Length of queue: {len(crashes_list_without_skips)}")

print("\nStarting CR3 downloads:")


def process_crash_cr3_threaded(crash_record):
    try:
        process_crash_cr3(
            crash_record,
            CRIS_BROWSER_COOKIES,
            skipped_uploads_and_updates,
        )
        print(f"Processed crash ID: {crash_record['crash_id']}")
    except Exception as e:
        print(f"Error processing crash ID {crash_record['crash_id']}: {str(e)}")
        skipped_uploads_and_updates.append(str(crash_record["crash_id"]))


max_workers = 4  # Specify the number of concurrent downloaders

with ThreadPoolExecutor(max_workers=max_workers) as executor:
    futures = []
    for crash_record in crashes_list_without_skips:
        future = executor.submit(process_crash_cr3_threaded, crash_record)
        futures.append(future)

    for future in futures:
        future.result()

print("\nProcess done.")

if skipped_uploads_and_updates:
    skipped_downloads = ", ".join(skipped_uploads_and_updates)
    print(f"\nUnable to download pdfs for crash IDs: {skipped_downloads}")

end = time.time()
hours, rem = divmod(end - start, 3600)
minutes, seconds = divmod(rem, 60)
print("\nFinished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds))
