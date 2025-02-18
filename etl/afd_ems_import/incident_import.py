#!/usr/bin/ python
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
BUCKET_ENV = os.getenv("BUCKET_ENV")

BATCH_SIZE = 1000

s3_client = client("s3")
s3_resource = resource("s3")


logging.basicConfig(stream=sys.stdout, level=logging.INFO)


def get_emails_todo(source, subdir="inbox"):
    """Get a list of S3 object keys of the email messages in the /inbox.

    Args:
        source (str): The data source: `afd` or `ems`
        subdir (str, optional): The S3 bucket subdirectory to check. Defaults to "inbox".

    Raises:
        IOError: If not objects are found in the bucket subdirectory

    Returns:
        List: List of S3 object keys, sorted oldest to newest by modified date
    """
    prefix = f"{BUCKET_ENV}/{source}_incidents/{subdir}"
    logging.info(f"Checking for files in: {prefix}")
    response = s3_client.list_objects(
        Bucket=BUCKET_NAME,
        Prefix=prefix,
    )
    emails = []
    for item in response.get("Contents", []):
        key = item.get("Key")
        # ignore the subdirectory itself
        if not key.endswith("/"):
            last_modified = item.get("LastModified")
            emails.append((key, last_modified))
    if not len(emails):
        raise IOError("No emails found in S3 bucket")
    # sort oldest -> newest
    emails.sort(key=lambda x: x[1])
    # return object keys only
    return [email[0] for email in emails]


def download_email(email_obj_key):
    """Download an email message from S3"""
    logging.info(f"Downloading: {email_obj_key}")
    file_object = BytesIO()
    s3_client.download_fileobj(BUCKET_NAME, email_obj_key, file_object)
    file_object.seek(0)
    return file_object.read().decode("utf-8")


def get_data_from_email_str(source, email_str):
    """Parse raw email content and return the attachment as a list of dictionaries

    Args:
        source (str): The data source: `afd` or `ems`
        email_str (str): the decoded email string

    Returns:
        list: list of row dictionaries of the parsed CSV attachment
    """
    logging.info("Getting attachment from email...")
    message = email.message_from_string(email_str)
    attachment = message.get_payload()[1]
    attachment_data = BytesIO(attachment.get_payload(decode=True))

    logging.info("Parsing attachment data...")
    if source == "ems":
        reader = csv.DictReader(TextIOWrapper(attachment_data, encoding="iso-8859-1"))
        return [row for row in reader]
    elif source == "afd":
        from pandas import read_excel

        data = read_excel(
            attachment_data, header=0, dtype={"Inc_Time": str, "Inc_Date": str}
        )
        return data.to_dict("records")


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
            if val == "" or val == "None" or val == "-":
                row[key] = None


def rename_columns(data, cols_to_rename):
    """Rename columns in a list of row dictionaries.

    Args:
        data (list): the data to be processed
        cols_to_rename (dict): a dict in the format { <old-name>: <new-name> }
    """
    for row in data:
        for source_key, target_key in cols_to_rename.items():
            row[target_key] = row.pop(source_key)


def listify_apd_incident_numbers(data):
    """Parse the apd_incident_numbers str into a list. This is only needed for EMS
    records"""
    for row in data:
        incident_nums = row["apd_incident_numbers"]
        row["unparsed_apd_incident_numbers"] = incident_nums
        if incident_nums:
            row["apd_incident_numbers"] = (
                incident_nums.replace("-", "").replace(" ", "").split(",")
            )


def listify_ems_incident_numbers(data):
    """Parse the EMS incident numbers into a list. This is only needed for AFD records.

    We are handling a string that looks like `1234-5678; 1234-5679`"""
    for row in data:
        row["unparsed_ems_incident_number"] = row["ems_incident_numbers"]
        if row["ems_incident_numbers"]:
            incident_nums = row["ems_incident_numbers"].replace("-", "")
            row["ems_incident_numbers"] = incident_nums.split(";")
        else:
            row["ems_incident_numbers"] = None


def handle_afd_timestamps(data):
    """Handle the AFD timestamp columns. We receive two, both in local time:
    - Inc_Date (renamed to call_date): a datetime string where the time is always 00:00:00
    - Inc_Time (renamed to call_time): a datetime string with the correct date and time

    In the DB, we're targeting:
        - call_date (type: date)
        - call_time (type: time)
        - call_datetime (type: timestamp)
    """
    for row in data:
        if row["call_time"]:
            dt_str, time_str = row["call_time"].split(" ")
            row["call_datetime"] = row["call_time"]
            row["call_date"] = dt_str
            row["call_time"] = time_str


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def main(*, source, skip_archive):
    logging.info(f"Running incident import for source: {source}")
    emails_todo = get_emails_todo(source)
    logging.info(f"{len(emails_todo)} files to process")

    # construct upsert mutation by patching columns to update on upsert
    upsert_mutation = MUTATIONS[source].replace(
        "$updateColumns", ", ".join(COLUMNS[source]["update_columns"])
    )

    for email_obj_key in emails_todo:
        logging.info("Processing data...")
        email_str = download_email(email_obj_key)
        data = get_data_from_email_str(source, email_str)
        data = lower_case_keys(data)
        set_empty_strings_to_none(data)
        rename_columns(data, COLUMNS[source]["cols_to_rename"])
        if source == "ems":
            listify_apd_incident_numbers(data)
        elif source == "afd":
            listify_ems_incident_numbers(data)
            handle_afd_timestamps(data)
        for chunk in chunks(data, BATCH_SIZE):
            logging.info(f"Upserting {len(chunk)} rows...")
            make_hasura_request(query=upsert_mutation, variables={"objects": chunk})
        if not skip_archive:
            archive_email(email_obj_key)


if __name__ == "__main__":
    args = get_cli_args()
    main(source=args.source, skip_archive=args.skip_archive)
