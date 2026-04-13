#!/usr/bin/ python
import csv
from datetime import datetime
import logging
import os
import sys
from zoneinfo import ZoneInfo

from boto3 import client, resource

from utils.cli import get_cli_args
from utils.columns import COLUMNS
from utils.graphql import make_hasura_request
from utils.queries import (
    UPSERT_CAD_INCIDENTS_MUTATION,
    UPSERT_CAD_INCIDENT_GROUPS_MUTATION,
)

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")
BUCKET_ENV = os.getenv("BUCKET_ENV")

BATCH_SIZE = 1000

s3_client = client("s3")
s3_resource = resource("s3")


logging.basicConfig(stream=sys.stdout, level=logging.INFO)


def get_files_todo(subdir="inbox"):
    """Get a list of S3 object keys of files to process in the /inbox.

    Args:
        subdir (str, optional): The S3 bucket subdirectory to check. Defaults to "inbox".

    Raises:
        IOError: If no objects are found in the bucket subdirectory

    Returns:
        List: List of S3 object keys, sorted oldest to newest by modified date
    """
    prefix = f"{BUCKET_ENV}/cad_incidents/{subdir}"
    logging.info(f"Checking for files in: {prefix}")
    response = s3_client.list_objects(
        Bucket=BUCKET_NAME,
        Prefix=prefix,
    )
    files = []
    for item in response.get("Contents", []):
        key = item.get("Key")
        # ignore the subdirectory itself
        if not key.endswith("/"):
            last_modified = item.get("LastModified")
            files.append((key, last_modified))
    if not len(files):
        raise IOError("No files found in S3 bucket")
    # sort oldest -> newest
    files.sort(key=lambda x: x[1])
    # return object keys only
    return [file[0] for file in files]


def download_file(file_obj_key):
    """Download an email message from S3"""
    logging.info(f"Downloading: {file_obj_key}")
    file_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=file_obj_key)
    raw = file_obj["Body"].read()
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        return raw.decode("cp1252")


def archive_file(file_obj_key):
    """Move email fom ./inbox to ./archive

    Args:
        email_obj_key (str): the s3 object file key of the email file to be archved
    """
    new_key = file_obj_key.replace("inbox", "archive")
    logging.info(f"Archiving {file_obj_key}")
    s3_resource.meta.client.copy(
        {"Bucket": BUCKET_NAME, "Key": file_obj_key}, BUCKET_NAME, new_key
    )
    s3_client.delete_object(Bucket=BUCKET_NAME, Key=file_obj_key)


def lower_case_keys(data):
    """Copy a list of row dicts by making each key lower case"""
    return [{key.lower(): value for key, value in row.items() if key} for row in data]


def set_empty_strings_to_none(data):
    """Traverse every row property and set '', '-', 'None', and 'NULL' to None"""
    for row in data:
        for key, val in row.items():
            if val == "" or val == "None" or val == "-" or val == "NULL":
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


def make_fields_timezone_aware(
    data, date_field_names, date_format="%Y-%m-%d %H:%M:%S", tz="America/Chicago"
):
    """Update a field to be timezone aware by replacing the input value with a ISO sting with a
    tz offset

    Args:
        data (list): list of incident dicts
        date_field_names (str[]): list of field names which hold date values to update
        date_format (str): the format of the input date string, which will be use to parse the string
            into a datetime object
        tz (string): The IANA time zone name of the input time value. Defaluts to America/Chicago
    """
    tzinfo = ZoneInfo(tz)
    for row in data:
        for date_field_name in date_field_names:
            input_date_string = row.get(date_field_name)
            if not input_date_string:
                continue
            if "." in input_date_string:
                # remove microseconds if present
                input_date_string = input_date_string.split(".")[0]

            parsed_date = datetime.strptime(input_date_string, date_format)
            parsed_date_tz = parsed_date.replace(tzinfo=tzinfo)
            row[date_field_name] = parsed_date_tz.isoformat()


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


sample = {
    "Agency_Type": "FIRE",
    "Master_Incident_Number": "15013354",
    "Master_Incident_ID": "13753464",
    "Address": "2700 Esperanza Xing",
    "Incident_Type": "D - Collision Priority 4F",
    "Priority_Number": "9",
    "Priority_Description": "4M",
    "Response_Date": "2015-02-09 22:19:22.000",
    "Time_First_Unit_Arrived": "NULL",
    "Time_CallClosed": "2015-02-09 22:23:12.000",
    "Initial_Problem": "Traffic Injury Pri 4F",
    "Final_Problem": "Traffic Injury Pri 4F",
    "Call_Disposition": "CBA - Canceled Before Arrival",
    "Latitude": "30397847",
    "Longitude": "97718067",
}


def transform_lat_lon(data):
    """Translate the input lat/lon from integers to decimals.

    For whatever reason, this data is given to us positive integers that can
    be converted back to decimal degrees with some simple arithmetic.

    Data is updated in place
    """
    for row in data:
        lat = row["latitude"]
        lon = row["longitude"]
        if lon:
            row["longitude"] = (float(lon) * -1) / 1000000
        if lat:
            row["latitude"] = float(lat) / 1000000


def main(*, skip_archive):
    logging.info(f"Running CAD incident import")
    files_todo = get_files_todo()
    logging.info(f"{len(files_todo)} files to process")

    if not files_todo:
        raise Exception("No CAD files found in S3 inbox")

    for file_obj_key in files_todo:

        is_group_id_file = "GroupID" in file_obj_key

        if not is_group_id_file:
            continue

        logging.info("Processing data...")
        csv_content = download_file(file_obj_key)

        reader = csv.DictReader(csv_content.splitlines())
        data = list(reader)
        data = lower_case_keys(data)

        if not data:
            raise Exception("CAD file contains no records")

        set_empty_strings_to_none(data)
        rename_columns(data, COLUMNS["cols_to_rename"])
        transform_lat_lon(data)
        make_fields_timezone_aware(
            data, date_field_names=["response_date", "time_call_closed"]
        )

        logging.info(f"{len(data):,} total records to upsert.")

        # add update column names to the muation "on conflict" directive
        column_names_to_upsert = list(data[0].keys())
        column_names_to_upsert.remove("master_incident_id")
        upsert_mutation = UPSERT_CAD_INCIDENTS_MUTATION.replace(
            "$updateColumns", "\n".join(column_names_to_upsert)
        )

        seen_ids = set()
        unique_rows = []
        incident_groups = []

        for row in data:
            master_incident_id = row["master_incident_id"]
            incident_group_id = row["incident_group_id"]
            if incident_group_id:
                incident_groups.append(
                    {
                        "master_incident_id": master_incident_id,
                        "incident_group_id": incident_group_id,
                    }
                )
            if master_incident_id not in seen_ids:
                seen_ids.add(master_incident_id)
                unique_rows.append(row)

        for chunk in chunks(unique_rows, BATCH_SIZE):
            logging.info(f"Upserting {len(chunk)} rows...")
            make_hasura_request(query=upsert_mutation, variables={"objects": chunk})

        for chunk in chunks(incident_groups, BATCH_SIZE):
            logging.info(f"Upserting {len(chunk)} rows...")
            make_hasura_request(
                query=UPSERT_CAD_INCIDENT_GROUPS_MUTATION, variables={"objects": chunk}
            )

        # if not skip_archive:
        # archive_file(file_obj_key)


if __name__ == "__main__":
    args = get_cli_args()
    main(skip_archive=args.skip_archive)
