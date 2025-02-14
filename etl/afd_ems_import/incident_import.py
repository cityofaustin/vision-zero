#!/usr/bin/env python
import csv
import email
from io import BytesIO, TextIOWrapper
import logging
import os
import sys

from boto3 import client, resource

from utils.cli import get_cli_args
from utils.columns import COLUMNS
from utils.graphql import make_hasura_request
from utils.queries import MUTATIONS

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")
ENV = os.getenv("ENV")

BATCH_SIZE = 1000

s3_client = client("s3")
s3_resource = resource("s3")


logging.basicConfig(stream=sys.stdout, level=logging.INFO)


def get_emails_todo(subdir="inbox"):
    prefix = f"{ENV}/ems_incidents/{subdir}"
    logging.info(f"Checking for files in: {prefix}")
    response = s3_client.list_objects(
        Bucket=BUCKET_NAME,
        Prefix=prefix,
    )
    emails = []
    for item in response.get("Contents", []):
        key = item.get("Key")
        last_modified = item.get("LastModified")
        # ignore the subdirectory itself
        if not key.endswith("/"):
            emails.append((key, last_modified))
    if not len(emails):
        raise IOError("No emails found in S3 bucket")
    # sort oldest -> newest
    emails.sort(key=lambda x: x[1])
    # return object keys only
    return [email[0] for email in emails]


def download_email(email_obj_key):
    logging.info(f"Downloading: {email_obj_key}")
    file_object = BytesIO()
    s3_client.download_fileobj(BUCKET_NAME, email_obj_key, file_object)
    file_object.seek(0)
    return file_object.read().decode("utf-8")


def get_data_from_email_str(email_str):
    """Parse raw email content and return the attachment as a list of dictionarooes

    Args:
        email_str (st): the decoded email string

    Returns:
        list: list of row dictionaries of the parsed CSV attachment
    """
    message = email.message_from_string(email_str)
    attachment = message.get_payload()[1]
    attachment_data = BytesIO(attachment.get_payload(decode=True))
    reader = csv.DictReader(TextIOWrapper(attachment_data, encoding="iso-8859-1"))
    return [row for row in reader]


def archive_email(email_obj_key):
    """Move email fom ./inbox to ./archive

    Args:
        email_obj_key (str): the s3 object file key of the email file to be archved
    """
    new_key = email_obj_key.replace("inbox", "archive")
    logging.info(f"Archiving {email_obj_key}")
    s3_resource.meta.client.copy(
        {"Bucket": BUCKET_NAME, "Key": email_obj_key}, BUCKET_NAME, new_key
    )
    s3_client.delete_object(Bucket=BUCKET_NAME, Key=email_obj_key)


def lower_case_keys(data):
    """Copy a list of row dicts by making each key lower case"""
    return [{key.lower(): value for key, value in row.items() if key} for row in data]


def set_empty_strings_to_none(data):
    """Traverse every row property and set '' to None"""
    for row in data:
        for key, val in row.items():
            if val == "":
                row[key] = None
            elif val == "None":
                row[key] = None


def rename_columns(data, cols_to_rename):
    for row in data:
        for source_key, target_key in cols_to_rename.items():
            row[target_key] = row.pop(source_key)


def listify_apd_incident_numbers(data):
    for row in data:
        incident_nums = row["apd_incident_numbers"]
        row["unparsed_apd_incident_numbers"] = incident_nums
        if incident_nums:
            row["apd_incident_numbers"] = (
                incident_nums.replace("-", "").replace(" ", "").split(",")
            )


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def main(source):
    logging.info(f"Running incident import for source: {source}")
    emails_todo = get_emails_todo()
    logging.info(f"{len(emails_todo)} files to process")

    # construct upsert mutation by patching columns to update on upsert
    upsert_mutation = MUTATIONS[source].replace(
        "$updateColumns", ", ".join(COLUMNS[source]["update_columns"])
    )

    for email_obj_key in emails_todo:
        logging.info("Processing data...")
        email_str = download_email(email_obj_key)
        data = get_data_from_email_str(email_str)
        data = lower_case_keys(data)
        set_empty_strings_to_none(data)
        rename_columns(data, COLUMNS[source]["cols_to_rename"])
        if source == "ems":
            listify_apd_incident_numbers(data)
        for chunk in chunks(data, BATCH_SIZE):
            logging.info(f"Upserting {len(chunk)} rows...")
            make_hasura_request(query=upsert_mutation, variables={"objects": chunk})
        # archive_email(email_obj_key)


if __name__ == "__main__":
    args = get_cli_args()
    main(args.source)
