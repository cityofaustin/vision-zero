#!/usr/bin/env python
"""
CRIS - CR3 Downloader
Author: Austin Transportation Department, Data and Technology Services

Description: This script allows the user to log in to the CRIS website
and download CR3 pdf files as needed. The list of CR3 files to be downloaded
is obtained from Hasura, and it is contingent to records that do not have
any CR3 files associated.
"""

import os
import time
import json

from process.helpers_cr3 import *

from onepasswordconnectsdk.client import Client, new_client
import onepasswordconnectsdk

ONEPASSWORD_CONNECT_HOST = os.getenv("OP_CONNECT")
ONEPASSWORD_CONNECT_TOKEN = os.getenv("OP_API_TOKEN")
VAULT_ID = os.getenv("OP_VAULT_ID")


def wait(int):
    print("Should wait: %s" % str(int))
    time.sleep(int)


# Start timer
start = time.time()

# Setup 1Password server connection
one_password_client = new_client(ONEPASSWORD_CONNECT_HOST, ONEPASSWORD_CONNECT_TOKEN)

# Get required secrets from 1Password
REQUIRED_SECRETS = {
    "HASURA_ENDPOINT": {
        "opitem": "Vision Zero CRIS Import",
        "opfield": "production.GraphQL Endpoint",
    },
    "HASURA_ADMIN_KEY": {
        "opitem": "Vision Zero CRIS Import",
        "opfield": "production.GraphQL Endpoint key",
    },
    "AWS_ACCESS_KEY_ID": {
        "opitem": "CR3 Download IAM Access Key and Secret",
        "opfield": "production.accessKeyId",
    },
    "AWS_SECRET_ACCESS_KEY": {
        "opitem": "CR3 Download IAM Access Key and Secret",
        "opfield": "production.accessSecret",
    },
    "AWS_DEFAULT_REGION": {
        "opitem": "CR3 Download IAM Access Key and Secret",
        "opfield": "production.awsDefaultRegion",
    },
    "ATD_CRIS_CR3_URL": {
        "opitem": "CRIS CR3 Download",
        "opfield": "production.ATD_CRIS_CR3_URL",
    },
    "AWS_CRIS_CR3_DOWNLOAD_PATH": {
        "opitem": "CRIS CR3 Download",
        "opfield": "production.AWS_CRIS_CR3_DOWNLOAD_PATH",
    },
    "AWS_CRIS_CR3_BUCKET_NAME": {
        "opitem": "CRIS CR3 Download",
        "opfield": "production.AWS_CRIS_CR3_BUCKET_NAME",
    },
}
for value in REQUIRED_SECRETS.values():
    value["opvault"] = VAULT_ID

env_vars = onepasswordconnectsdk.load_dict(one_password_client, REQUIRED_SECRETS)

# Set enivronment variables for S3 upload with boto3
for key, value in env_vars.items():
    os.environ[key] = value

# TODO: Set max attempts and retry wait time as environment variables
# TODO: Figure out what to do about requests grabbing secrets from ATD_ETL_CONFIG

#
# We now need to request a list of N number of records
# that do not have a CR3. For each record we must download
# the CR3 pdf, upload to S3
#

# ask user for a set of valid cookies for requests to the CRIS website
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
known_skips = [180290542]

crashes_list_without_skips = []

try:
    print("Hasura endpoint: '%s' " % os.environ["HASURA_ENDPOINT"])
    # downloads_per_run = ATD_ETL_CONFIG["ATD_CRIS_CR3_DOWNLOADS_PER_RUN"]
    downloads_per_run = 2000
    print("Downloads Per This Run: %s" % str(downloads_per_run))

    response = get_crash_id_list(downloads_per_run=downloads_per_run)
    print("\nResponse from Hasura: %s" % json.dumps(response))

    crashes_list = response["data"]["atd_txdot_crashes"]

    crashes_list_without_skips = [
        x for x in crashes_list if x["crash_id"] not in known_skips
    ]
    print(
        "\nList of crashes needing CR3 download: %s"
        % json.dumps(crashes_list_without_skips)
    )

    print("\nStarting CR3 downloads:")
except Exception as e:
    crashes_list_without_skips = []
    print("Error, could not run CR3 processing: " + str(e))


for crash_record in crashes_list_without_skips:
    process_crash_cr3(crash_record, CRIS_BROWSER_COOKIES, skipped_uploads_and_updates)

print("\nProcess done.")

if skipped_uploads_and_updates:
    skipped_downloads = ", ".join(skipped_uploads_and_updates)
    print(f"\nUnable to download pdfs for crash IDs: {skipped_downloads}")

end = time.time()
hours, rem = divmod(end - start, 3600)
minutes, seconds = divmod(rem, 60)
print("\nFinished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds))
