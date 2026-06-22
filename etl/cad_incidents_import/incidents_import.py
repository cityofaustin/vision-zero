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
    read_file_local,
)
from utils.graphql import make_hasura_request
from utils.queries import (
    UPSERT_CAD_INCIDENTS_MUTATION,
    UPSERT_CAD_INCIDENT_GROUPS_MUTATION,
)

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

COACD_MOUNT_PATH = os.environ.get("COACD_MOUNT_PATH", "/mnt/vision_zero_cad")

UPSERT_BATCH_SIZE = 1000


logging.basicConfig(stream=sys.stdout, level=logging.INFO)


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
    """Update a field to be timezone aware by replacing the input value with a ISO string with a
    tz offset

    Args:
        data (list): list of incident dicts
        date_field_names (str[]): list of field names which hold date values to update
        date_format (str): the format of the input date string, which will be use to parse the string
            into a datetime object
        tz (string): The IANA time zone name of the input time value. Defaults to America/Chicago
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


def prune_and_validate_columns(data, allowed_columns):
    """
    Removes unknown columns from each record and raises an error if any
    required columns are missing.

    Args:
        data (list): list of cad records
        allowed_columns (list): list of column name strings

    Returns:
        list: data with record dicts containing only allowed columns

    Raises:
        ValueError: if any record is missing one or more allowed columns
    """
    allowed = set(allowed_columns)
    pruned = []
    for i, record in enumerate(data):
        record_keys = set(record.keys())
        missing = allowed - record_keys
        if missing:
            raise ValueError(
                f"Record at index {i} is missing required columns: {sorted(missing)}"
            )
        pruned.append({key: val for key, val in record.items() if key in allowed})
    return pruned


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
        if args.no_files_pass:
            return
        raise Exception(
            f"No CAD files found in {"local directory" if args.local_files else "S3 inbox"}"
        )

    for file_obj_key_or_path in files_todo:
        is_group_id_file = "GroupID" in file_obj_key_or_path
        table_name = "cad_incidents" if not is_group_id_file else "cad_incident_groups"

        if args.local_files:
            logging.info(f"Loading local file: {file_obj_key_or_path}")
            csv_content = read_file_local(file_obj_key_or_path)
        else:
            logging.info(f"Downloading: {file_obj_key_or_path}")
            csv_content = download_file_s3(file_obj_key_or_path)

        reader = csv.DictReader(csv_content.splitlines())
        data = list(reader)

        if not data:
            raise Exception("CAD file contains no records")

        data = lower_case_keys(data)

        columns_to_rename = COLUMNS["cols_to_rename"].get(table_name)
        if columns_to_rename:
            rename_columns(data, columns_to_rename)

        data = prune_and_validate_columns(data, COLUMNS["allowed_columns"][table_name])

        set_empty_strings_to_none(data)

        if not is_group_id_file:
            transform_lat_lon(data)
            make_fields_timezone_aware(
                data,
                date_field_names=[
                    "response_date",
                    "time_call_closed",
                    "time_first_unit_arrived",
                ],
            )

        if not is_group_id_file:
            # add update column names to the muation "on conflict" directive
            column_names_to_upsert = list(data[0].keys())
            # remove master_incident_id because it is the unique record ID
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

        for chunk in chunks(data, UPSERT_BATCH_SIZE):
            if not args.dry_run:
                logging.info(f"Upserting {len(chunk)} rows...")
                make_hasura_request(query=upsert_mutation, variables={"objects": chunk})
            else:
                logging.info(f"Would upsert {len(chunk)}")

        if args.archive and not args.local_files:
            if not args.dry_run:
                logging.info(f"Archiving {file_obj_key_or_path}")
                archive_file_s3(file_obj_key_or_path)
            else:
                logging.info(f"Would archive {file_obj_key_or_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Import CAD incident records into the Vision Zero Database",
        usage="import_incidents.py ems",
    )
    parser.add_argument(
        "--archive",
        help="Move each processed file to the S3 bucket's /archive directory",
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
    parser.add_argument(
        "--no-files-pass",
        action="store_true",
        help="Don't throw an error if there are no files to process",
    )
    args = parser.parse_args()
    main(args)
