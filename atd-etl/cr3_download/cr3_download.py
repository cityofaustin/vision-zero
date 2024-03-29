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
import argparse
from concurrent.futures import ThreadPoolExecutor

from process.helpers_cr3 import process_crash_cr3, get_crash_id_list
from onepasswordconnectsdk.client import new_client
import onepasswordconnectsdk


def load_secrets(one_password_client, vault_id):
    """Load required secrets from 1Password."""
    required_secrets = {
        "HASURA_ENDPOINT": {
            "opitem": "Vision Zero graphql-engine Endpoints",
            "opfield": "production.GraphQL Endpoint",
            "opvault": vault_id,
        },
        "HASURA_ADMIN_KEY": {
            "opitem": "Vision Zero graphql-engine Endpoints",
            "opfield": "production.Admin Key",
            "opvault": vault_id,
        },
        "AWS_ACCESS_KEY_ID": {
            "opitem": "CR3 Download IAM Access Key and Secret",
            "opfield": "production.accessKeyId",
            "opvault": vault_id,
        },
        "AWS_SECRET_ACCESS_KEY": {
            "opitem": "CR3 Download IAM Access Key and Secret",
            "opfield": "production.accessSecret",
            "opvault": vault_id,
        },
        "AWS_DEFAULT_REGION": {
            "opitem": "CR3 Download IAM Access Key and Secret",
            "opfield": "production.awsDefaultRegion",
            "opvault": vault_id,
        },
        "ATD_CRIS_CR3_URL": {
            "opitem": "Vision Zero CRIS CR3 Download",
            "opfield": "production.ATD_CRIS_CR3_URL",
            "opvault": vault_id,
        },
        "AWS_CRIS_CR3_BUCKET_NAME": {
            "opitem": "Vision Zero CRIS CR3 Download",
            "opfield": "production.AWS_CRIS_CR3_BUCKET_NAME",
            "opvault": vault_id,
        },
        "AWS_CRIS_CR3_BUCKET_PATH": {
            "opitem": "Vision Zero CRIS CR3 Download",
            "opfield": "production.AWS_CRIS_CR3_BUCKET_PATH",
            "opvault": vault_id,
        },
    }

    return onepasswordconnectsdk.load_dict(one_password_client, required_secrets)


def process_crash_cr3_threaded(
    crash_record, cris_browser_cookies, skipped_uploads_and_updates, verbose
):
    """Process a crash record in a separate thread."""
    try:
        process_crash_cr3(
            crash_record, cris_browser_cookies, skipped_uploads_and_updates, verbose
        )
        if verbose:
            print(f"Processed crash ID: {crash_record['crash_id']}")
    except Exception as e:
        print(f"Error processing crash ID {crash_record['crash_id']}: {str(e)}")
        skipped_uploads_and_updates.append(str(crash_record["crash_id"]))


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="CRIS - CR3 Downloader")
    parser.add_argument(
        "-t",
        "--threads",
        type=int,
        default=1,
        help="Number of concurrent downloaders (default: 1)",
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Enable verbose logging"
    )
    args = parser.parse_args()

    # Start timer
    start = time.time()

    # Get 1Password secrets from environment
    ONEPASSWORD_CONNECT_HOST = os.getenv("OP_CONNECT")
    ONEPASSWORD_CONNECT_TOKEN = os.getenv("OP_API_TOKEN")
    VAULT_ID = os.getenv("OP_VAULT_ID")

    # Setup 1Password server connection
    one_password_client = new_client(
        ONEPASSWORD_CONNECT_HOST, ONEPASSWORD_CONNECT_TOKEN
    )

    # Load secrets from 1Password and set them in the environment
    env_vars = load_secrets(one_password_client, VAULT_ID)
    for key, value in env_vars.items():
        os.environ[key] = value

    # Ask user for a set of valid cookies for requests to the CRIS website
    CRIS_BROWSER_COOKIES = input(
        "Please login to CRIS and extract the contents of the Cookie: header and please paste it here: "
    )

    if args.verbose:
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
        if args.verbose:
            print(f"Hasura endpoint: '{os.getenv('HASURA_ENDPOINT')}'")

        response = get_crash_id_list()

        crashes_list = response["data"]["atd_txdot_crashes"]
        crashes_list_without_skips = [
            x for x in crashes_list if x["crash_id"] not in known_skips
        ]

    except Exception as e:
        crashes_list_without_skips = []
        print(f"Error, could not run CR3 processing: {str(e)}")

    if args.verbose:
        print(f"Length of queue: {len(crashes_list_without_skips)}")
        print("Starting CR3 downloads:")

    max_workers = args.threads
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = []
        for crash_record in crashes_list_without_skips:
            future = executor.submit(
                process_crash_cr3_threaded,
                crash_record,
                CRIS_BROWSER_COOKIES,
                skipped_uploads_and_updates,
                args.verbose,
            )
            futures.append(future)

        for future in futures:
            future.result()

    print("Process done.")

    if skipped_uploads_and_updates:
        skipped_downloads = ", ".join(skipped_uploads_and_updates)
        print(f"\nUnable to download PDFs for crash IDs: {skipped_downloads}")

    end = time.time()
    hours, rem = divmod(end - start, 3600)
    minutes, seconds = divmod(rem, 60)
    print(
        "\nFinished in: {:0>2}:{:0>2}:{:05.2f}".format(
            int(hours), int(minutes), seconds
        )
    )


if __name__ == "__main__":
    main()
