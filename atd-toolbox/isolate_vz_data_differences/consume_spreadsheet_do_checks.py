#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras
from tqdm import tqdm
import json
from datetime import datetime
import decimal
import logging
import random


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def main():

    db_connection_string = os.getenv("DATABASE_CONNECTION")

    if db_connection_string is None:
        raise EnvironmentError("DATABASE_CONNECTION environment variable is not set")

    job = read_json_file("spreadsheet_of_columns.json")

    crashes(db_connection_string, job)
    units(db_connection_string, job)


def units(db_connection_string, job):
    with psycopg2.connect(db_connection_string) as conn:
        # build up a mondo dictionary of the whole table keyed on a tuple of the primary key(s)
        sql = "select * from units_cris"
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            units_cris = {
                (row["cris_crash_id"], row["unit_nbr"]): dict(row)
                for row in tqdm(rows, desc="Building dictionary of units_cris")
            }

            # random_key = random.choice(list(units_cris.keys()))
            # print("Key:", random_key)
            # print("Value:", units_cris[random_key])

        # another big dictionary of the whole table
        sql = "select * from atd_txdot_units"
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            units_classic_vz = {
                (row["crash_id"], row["unit_nbr"]): dict(row)
                for row in tqdm(rows, desc="Building dictionary of atd_txdot_units")
            }

        # cast the char Y/Ns to booleans
        for _, unit_data in tqdm(
            units_classic_vz.items(), desc="Casting Y/N into booleans"
        ):
            for key, value in list(
                unit_data.items()
            ):  # We use list to create a copy of items for iteration
                if key.endswith("_fl"):
                    if value == "Y":
                        unit_data[key] = True
                    elif value == "N":
                        unit_data[key] = False

        columns = filter_by_old_table_name(job, "atd_txdot_units")

        # fmt: off
        updates = []
        for unit_key in tqdm(units_cris, desc="Comparing values"):
            for column in columns:
                if column["target column name"] != "-":
                    if column["target column name"] in units_cris[unit_key]:
                        if (units_classic_vz[unit_key][column["old column name"]] != units_cris[unit_key][column["target column name"]]):
                            logging.debug(f"❌ {column['old column name']}: {units_classic_vz[unit_key][column['old column name']]} != {units_cris[unit_key][column['target column name']]}")
                            sql = f"update units_edits set {column['target column name']} = %s where id = (select id from units_cris where cris_crash_id = %s and unit_nbr = %s)"
                            parameters = (units_classic_vz[unit_key][column["old column name"]], unit_key[0], unit_key[1])
                            updates.append((sql, parameters))
                        else:
                            logging.debug(f"✅ {column['old column name']}: {units_classic_vz[unit_key][column['old column name']]} == {units_cris[unit_key][column['target column name']]}")
                    else:
                        if units_classic_vz[unit_key][column['old column name']]:
                            logging.debug(f"✨ VZ only column: No {column['target column name']} in units_cris, so {units_classic_vz[unit_key][column['old column name']]} going into units_edits")
                            sql = f"update units_edits set {column['target column name']} = %s where id = (select id from units_cris where cris_crash_id = %s and unit_nbr = %s)"
                            parameters = (units_classic_vz[unit_key][column["old column name"]], unit_key[0], unit_key[1])
                            updates.append((sql, parameters))
                        else:
                            logging.debug(f"🤷 VZ only column, but no {column['old column name']} in classic VZ data, so no value in units_edits's {column['target column name']}")
        # fmt: on

        # Mogrify and print the queries
        for update in tqdm(updates, desc="Mogrifying Queries"):
            with conn.cursor() as cur:
                mogrified_query = cur.mogrify(update[0], update[1]).decode()
                logging.debug(mogrified_query)

        # Execute the queries
        with conn.cursor() as cur:
            for query, params in tqdm(updates, desc="Executing Queries"):
                cur.execute(query, params)


def crashes(db_connection_string, job):
    with psycopg2.connect(db_connection_string) as conn:
        # build up a mondo dictionary of the whole table keyed on a tuple of the primary key(s)
        sql = "select * from crashes_cris"
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            crashes_cris = {
                (row["crash_id"],): dict(row)
                for row in tqdm(rows, desc="Building dictionary of crashes_cris")
            }

        # print(crashes_cris[(20006607,)])

        # another big dictionary of the whole table
        sql = "select * from atd_txdot_crashes"
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(sql)
            rows = cur.fetchall()
            crashes_classic_vz = {
                (row["crash_id"],): dict(row)
                for row in tqdm(rows, desc="Building dictionary of atd_txdot_crashes")
            }

        # cast the char Y/Ns to booleans
        for _, crash_data in tqdm(
            crashes_classic_vz.items(), desc="Casting Y/N into booleans"
        ):
            for key, value in list(
                crash_data.items()
            ):  # We use list to create a copy of items for iteration
                if key.endswith("_fl"):
                    if value == "Y":
                        crash_data[key] = True
                    elif value == "N":
                        crash_data[key] = False

        # cast floats into decimals
        for crash_id, crash_data in tqdm(
            crashes_classic_vz.items(),
            desc="Casting geographic coordinates into fixed precision",
        ):
            for key, value in list(
                crash_data.items()
            ):  # We use list to create a copy of items for iteration
                if "latitude" in key or "longitude" in key and value is not None:
                    try:
                        crash_data[key] = decimal.Decimal(str(value))
                    except decimal.InvalidOperation:
                        # unparsable value, like a 'None', no big.
                        pass

        # print(crashes_classic_vz[(20006607,)])

        columns = filter_by_old_table_name(job, "atd_txdot_crashes")

        # fmt: off
        updates = []
        for crash_key in tqdm(crashes_cris, desc="Comparing values"):
            for column in columns:
                if column["target column name"] != "-":
                    if column["target column name"] in crashes_cris[crash_key]:
                        if (crashes_classic_vz[crash_key][column["old column name"]] != crashes_cris[crash_key][column["target column name"]]):
                            logging.debug(f"❌ {column['old column name']}: {crashes_classic_vz[crash_key][column['old column name']]} != {crashes_cris[crash_key][column['target column name']]}")
                            sql = f"update crashes_edits set {column['target column name']} = %s where crash_id = %s"
                            parameters = (crashes_classic_vz[crash_key][column["old column name"]], crash_key[0])
                            updates.append((sql, parameters))
                        else:
                            logging.debug(f"✅ {column['old column name']}: {crashes_classic_vz[crash_key][column['old column name']]} == {crashes_cris[crash_key][column['target column name']]}")
                    else:
                        if crashes_classic_vz[crash_key][column['old column name']]:
                            logging.debug(f"✨ VZ only column: No {column['target column name']} in crashes_cris, so {crashes_classic_vz[crash_key][column['old column name']]} going into crashes_edits")
                            sql = f"update crashes_edits set {column['target column name']} = %s where crash_id = %s"
                            parameters = (crashes_classic_vz[crash_key][column["old column name"]], crash_key[0])
                            updates.append((sql, parameters))
                        else:
                            logging.debug(f"🤷 VZ only column, but no {column['old column name']} in classic VZ data, so no value in crashes_edits's {column['target column name']}")
        # fmt: on

        # Mogrify and print the queries
        for update in tqdm(updates, desc="Mogrifying Queries"):
            with conn.cursor() as cur:
                mogrified_query = cur.mogrify(update[0], update[1]).decode()
                logging.debug(mogrified_query)

        # Execute the queries
        with conn.cursor() as cur:
            for query, params in tqdm(updates, desc="Executing Queries"):
                cur.execute(query, params)


def filter_by_old_table_name(data, table_name):
    return [item for item in data if item["old table name"] == table_name]


def read_json_file(file_path):
    with open(file_path, "r") as json_file:
        data = json.load(json_file)
    return data


if __name__ == "__main__":
    main()
