#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras
from tqdm import tqdm
import json
from datetime import datetime


def main():

    db_connection_string = os.getenv("DATABASE_CONNECTION")

    if db_connection_string is None:
        raise EnvironmentError("DATABASE_CONNECTION environment variable is not set")

    job = read_json_file("spreadsheet_of_columns.json")

    with psycopg2.connect(db_connection_string) as conn:
        sql = "select * from crashes_cris"
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            crashes_cris = {(row["crash_id"],): dict(row) for row in rows}

        print(crashes_cris[(20006607,)])

        columns = filter_by_old_table_name(job, "atd_txdot_crashes")
        # print(columns)


def filter_by_old_table_name(data, table_name):
    return [item for item in data if item["old table name"] == table_name]


def read_json_file(file_path):
    with open(file_path, "r") as json_file:
        data = json.load(json_file)
    return data


if __name__ == "__main__":
    main()
