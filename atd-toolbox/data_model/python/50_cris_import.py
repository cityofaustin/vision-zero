import csv
from datetime import datetime
import io
import os
import time
from zoneinfo import ZoneInfo

import requests

from settings import COLUMN_ENDPOINT

FILE_DIR = "cris_csvs"
HASURA_ENDPOINT = "http://localhost:8084/v1/graphql"
UPLOAD_BATCH_SIZE = 1000

CRASH_UPSERT_MUTATION = """
mutation UpsertCrashes($objects: [db_crashes_cris_insert_input!]!) {
  insert_db_crashes_cris(
    objects: $objects, 
    on_conflict: {
        constraint: crashes_cris_pkey,
        update_columns: [$updateColumns]
    }) {
    affected_rows
  }
}
"""

UNIT_UPSERT_MUTATION = """
mutation UpsertUnits($objects: [db_units_cris_insert_input!]!) {
  insert_db_units_cris(
    objects: $objects, 
    on_conflict: {
        constraint: unique_units_cris,
        update_columns: [$updateColumns]
    }) {
    affected_rows
  }
}
"""

PERSON_UPSERT_MUTATION = """
mutation UpsertPeople($objects: [db_people_cris_insert_input!]!) {
  insert_db_people_cris(
    objects: $objects, 
    on_conflict: {
        constraint: unique_people_cris,
        update_columns: [$updateColumns]
    }) {
    affected_rows
  }
}"""

mutations = {
    "crashes": CRASH_UPSERT_MUTATION,
    "units": UNIT_UPSERT_MUTATION,
    "persons": PERSON_UPSERT_MUTATION,
}


def load_data(endpoint):
    res = requests.get(endpoint)
    res.raise_for_status()
    fin = io.StringIO(res.text)
    reader = csv.DictReader(fin)
    return [row for row in reader]


def get_cris_columns(column_metadata, table_name):
    """
    Given the column data from G drive, return an array of strings
    which is the column names for every column we want to handle from the
    CRIS import and the given table name
    """
    table_key = table_name
    if "person" in table_key:
        table_key = "people"

    cris_columns = [
        row["column_name"]
        for row in column_metadata
        if row["source"] == "cris"
        and table_key in row["table_name_new_cris"]
        and row["action"] == "migrate"
    ]
    # remove dupes, which is an artefact of our sheet having dupe person and primaryperson rows
    return list(set(cris_columns))


def make_upsert_mutation(table_name, cris_columns):
    """Sets the column names in the upsert on conflict array"""
    upsert_mutation = mutations[table_name]
    # this is a disgusting hack until we have column data formatted in a better way
    # we don't want to include crash_id in the on-conflict columns
    update_columns = cris_columns.copy()
    if table_name == "crashes":
        update_columns.remove("crash_id")
    return upsert_mutation.replace("$updateColumns", ", ".join(update_columns))


def make_hasura_request(*, query, endpoint, variables=None):
    payload = {"query": query, "variables": variables}
    res = requests.post(endpoint, json=payload)
    res.raise_for_status()
    data = res.json()
    try:
        return data["data"]
    except KeyError:
        raise ValueError(data)


def get_file_meta(filename):
    """
    Returns:
        schema_year, extract_id, table_name
    """
    filename_parts = filename.split("_")
    return filename_parts[1], filename_parts[2], filename_parts[3]


def get_files_todo():
    files_todo = []
    for filename in os.listdir(FILE_DIR):
        if not filename.endswith(".csv"):
            continue
        schema_year, extract_id, table_name = get_file_meta(filename)

        # ignore all tables except these
        if table_name not in ("crash", "unit", "person", "primaryperson"):
            continue

        file = {
            "schema_year": schema_year,
            "table_name": table_name,
            "path": os.path.join(FILE_DIR, filename),
            "extract_id": extract_id,
        }
        files_todo.append(file)
    return files_todo


def load_csv(filename):
    with open(filename, "r") as fin:
        reader = csv.DictReader(fin)
        return [row for row in reader]


def lower_case_keys(list_of_dicts):
    return [{key.lower(): value for key, value in row.items()} for row in list_of_dicts]


def remove_unsupported_columns(rows, cris_columns):
    return [
        {key: val for key, val in row.items() if key in cris_columns} for row in rows
    ]


def handle_empty_strings(rows):
    for row in rows:
        for key, val in row.items():
            if val == "":
                row[key] = None
    return rows


def combine_date_time_fields(
    rows, *, date_field_name, time_field_name, is_am_pm_format
):
    """Combine a date and time field and format as ISO string. The same ISO
    string is stored in both input field names.
    """
    tzinfo = ZoneInfo("America/Chicago")
    for row in rows:
        input_date_string = row[date_field_name]
        input_time_string = row[time_field_name]

        if not input_date_string or not input_time_string:
            continue

        # parse a date string that looks like '12/22/2023'
        month, day, year = input_date_string.split("/")

        hour = None
        minute = None
        if is_am_pm_format:
            # parse a time string that looks like '12:15 PM'
            hour_minute, am_pm = input_time_string.split(" ")
            hour, minute = hour_minute.split(":")
            if am_pm.lower() == "pm":
                hour = int(hour) + 12 if hour != "12" else int(hour)
            else:
                hour = int(hour) if hour != "12" else 0
        else:
            # parse a time string that looks like '12:00:00'
            hour, minute, second = input_time_string.split(":")

        # create a tz-aware instance of this datetime

        dt = datetime(
            int(year),
            int(month),
            int(day),
            hour=int(hour),
            minute=int(minute),
            tzinfo=tzinfo,
        )
        # save the ISO string with tz offset
        crash_date_iso = dt.isoformat()
        row[date_field_name] = crash_date_iso
        row[time_field_name] = crash_date_iso


def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def main():
    overall_start_tme = time.time()

    print("downloading column metadata...")
    column_metadata = load_data(COLUMN_ENDPOINT)

    files_todo = get_files_todo()
    extract_ids = list(set([f["extract_id"] for f in files_todo]))
    # assumes extract ids are sortable oldest > newest by filename. todo: is that right?
    extract_ids.sort()
    for extract_id in extract_ids:
        # get schema years that match this extract ID
        schema_years = list(
            set([f["schema_year"] for f in files_todo if f["extract_id"] == extract_id])
        )
        schema_years.sort()
        for schema_year in schema_years:
            for table_name in ["crashes", "units", "persons"]:
                cris_columns = get_cris_columns(column_metadata, table_name)
                file = next(
                    (
                        f
                        for f in files_todo
                        if f["extract_id"] == extract_id
                        and f["schema_year"] == schema_year
                        and table_name.startswith(f["table_name"])
                    ),
                    None,
                )

                if not file:
                    raise (
                        f"No {table_name} file found in extract. This should never happen!"
                    )

                print(f"processing {table_name}")

                records = handle_empty_strings(
                    remove_unsupported_columns(
                        lower_case_keys(load_csv(file["path"])),
                        cris_columns,
                    )
                )

                if table_name == "crashes":
                    combine_date_time_fields(
                        records,
                        date_field_name="crash_date",
                        time_field_name="crash_time",
                        is_am_pm_format=True,
                    )

                # annoying redundant branch to combine primary persons and persons
                if table_name == "persons":

                    p_person_file = next(
                        (
                            f
                            for f in files_todo
                            if f["extract_id"] == extract_id
                            and f["schema_year"] == schema_year
                            and f["table_name"].startswith("primaryperson")
                        ),
                        None,
                    )

                    for p in records:
                        p["is_primary_person"] = False

                    pp_records = handle_empty_strings(
                        remove_unsupported_columns(
                            lower_case_keys(load_csv(p_person_file["path"])),
                            cris_columns,
                        )
                    )
                    for pp in pp_records:
                        pp["is_primary_person"] = True

                    records = pp_records + records

                    combine_date_time_fields(
                        records,
                        date_field_name="prsn_death_date",
                        time_field_name="prsn_death_time",
                        is_am_pm_format=False,
                    )

                upsert_mutation = make_upsert_mutation(table_name, cris_columns)

                for chunk in chunks(records, UPLOAD_BATCH_SIZE):

                    print(f"uploading {len(chunk)} {table_name}...")
                    start_time = time.time()
                    make_hasura_request(
                        endpoint=HASURA_ENDPOINT,
                        query=upsert_mutation,
                        variables={"objects": chunk},
                    )
                    print(f"Done in {round(time.time() - start_time, 3)} seconds")

    print(
        f"Entire import completed in {round((time.time() - overall_start_tme)/60, 2)} minutes"
    )


main()
