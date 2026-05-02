#!/usr/bin/ python
import argparse
import csv
from datetime import datetime
import logging
import os
import sys
from zoneinfo import ZoneInfo


from utils.columns import COLUMNS
from utils.files import (
    archive_file_s3,
    download_file_s3,
    get_local_files_to_process,
    get_s3_files_todo,
)
from utils.graphql import make_hasura_request
from utils.queries import (
    UPSERT_CAD_INCIDENTS_MUTATION,
    UPSERT_CAD_INCIDENT_GROUPS_MUTATION,
)

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

COACD_MOUNT_PATH = os.environ.get("COACD_MOUNT_PATH", "/mnt/vision_zero_cad")

BATCH_SIZE = 1000


logging.basicConfig(stream=sys.stdout, level=logging.INFO)


def get_cli_args():
    parser = argparse.ArgumentParser(
        description="Import CAD incident records into the Vision Zero Database",
        usage="import_incidents.py ems",
    )
    parser.add_argument(
        "--skip-archive",
        "-s",
        help="Skip the archival step of moving each processed file to the S3 bucket's /archive directory",
        action="store_true",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log what files would be uploaded without actually doing it",
    )
    parser.add_argument(
        "--local-files",
        action="store_true",
        help="If true, process files from local COACD_MOUNT_PATH directory instead of AWS S3",
    )
    return parser.parse_args()


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


def main(args):
    logging.info(f"Running CAD incident import")

    if not args.local_files:
        logging.info(f"Getting list of files in S3 inbox")
        files_todo = get_s3_files_todo()
    else:
        files_todo = get_local_files_to_process(dir_name=COACD_MOUNT_PATH)

    logging.info(
        f"{len(files_todo)} {"local" if args.local_files else "S3"} files to process"
    )

    if not files_todo:
        raise Exception("No CAD files found in S3 inbox")

    for file_obj_key in files_todo:
        logging.info(f"Downloading: {file_obj_key}")
        csv_content = download_file_s3(file_obj_key)

        reader = csv.DictReader(csv_content.splitlines())
        data = list(reader)
        data = lower_case_keys(data)

        if not data:
            raise Exception("CAD file contains no records")

        set_empty_strings_to_none(data)

        is_group_id_file = "GroupID" in file_obj_key
        if not is_group_id_file:
            rename_columns(data, COLUMNS["cols_to_rename"])
            transform_lat_lon(data)
            make_fields_timezone_aware(
                data, date_field_names=["response_date", "time_call_closed"]
            )

        if not is_group_id_file:
            # add update column names to the muation "on conflict" directive
            column_names_to_upsert = list(data[0].keys())
            column_names_to_upsert.remove("master_incident_id")
            upsert_mutation = UPSERT_CAD_INCIDENTS_MUTATION.replace(
                "$updateColumns", "\n".join(column_names_to_upsert)
            )
        else:
            upsert_mutation = UPSERT_CAD_INCIDENT_GROUPS_MUTATION

        if is_group_id_file:
            # exclude rows that don't have a group ID
            # todo: what is the group ID??
            data = [
                row
                for row in data
                if row["incident_group_id"] and row["master_incident_id"]
            ]

        logging.info(f"{len(data):,} total records to upsert")

        for chunk in chunks(data, BATCH_SIZE):
            if not args.dry_run:
                logging.info(f"Upserting {len(chunk)} rows...")
                make_hasura_request(query=upsert_mutation, variables={"objects": chunk})
            else:
                logging.info(f"Would upsert {len(chunk)}")

        if not args.skip_archive and not args.local_files:
            if not args.dry_run:
                logging.info(f"Archiving {file_obj_key}")
                archive_file_s3(file_obj_key)
            else:
                logging.info(f"Would archive {file_obj_key}")


if __name__ == "__main__":
    args = get_cli_args()
    main(args)
