#!/usr/bin/env python

import csv
import json
import time
import re
import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
import argparse

load_dotenv("env")

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_SSL_REQUIREMENT = os.getenv("DB_SSL_REQUIREMENT")


def get_pg_connection():
    """
    Returns a connection to the Postgres database
    """
    return psycopg2.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME,
        sslmode=DB_SSL_REQUIREMENT,
        sslrootcert="/root/rds-combined-ca-bundle.pem",
    )


def table_exists(conn, table_name):
    """
    Checks if a table exists in a PostgreSQL database.

    Args:
    conn (psycopg2.extensions.connection): A connection to the PostgreSQL database.
    table_name (str): The name of the table to check for existence.

    Returns:
    bool: True if the table exists, False otherwise.
    """
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = %s
                );
            """,
                (table_name,),
            )

            result = cur.fetchone()
            return result[0]

    except Exception as e:
        print(f"Error checking table existence: {e}")
        return False

def get_current_lkp_tables(conn):
    """
    Gets a list of all the lookup tables we have from CRIS in our database.

    Args:
    conn (psycopg2.extensions.connection): A connection to the PostgreSQL database.

    Returns:
    list: Containing the lookup table names.
    """
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT table_name 
                FROM information_schema.tables
                WHERE table_name LIKE 'atd_txdot%lkp'
                    AND table_schema = 'public'
                    AND table_type = 'BASE TABLE';
            """,
            )

            result = [record[0] for record in cur.fetchall()]
            return result

    except Exception as e:
        print(f"Error fetching lookup table names: {e}")
        return False

def get_lkp_values(conn, table_name, name_component):
    """
    Returns a dict where each key is the lookup table name and the value
    is a dict of all the lookup ids/descs for that lookup table

    Args:
    conn (psycopg2.extensions.connection): A connection to the PostgreSQL database.

    Returns:
    dict: Containing the lookup table and its values.
    """
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT {name_component}_id, {name_component}_desc
                FROM {table_name};
            """,
            )
            result = cur.fetchall()
            return dict(result)

    except Exception as e:
        print(f"Error fetching dict of {table_name}: {e}")
        return False


def read_and_group_csv(file_path):
    """
    Returns a dict where each key is the lookup table name and the value
    is a dict of all the lookup ids/descs for that lookup table
    """
    grouped_data = {}

    with open(file_path, newline="") as csvfile:
        csvreader = csv.reader(csvfile, delimiter=",", quotechar='"')

        # Skip the first row (header)
        next(csvreader)

        for row in csvreader:
            id_name = row[0]
            name = re.search(r"(^.*)_ID$", id_name)
            name_component = name.group(1).lower()
            table_name = "atd_txdot__" + name_component + "_lkp"
            inner_dict = {"id": int(row[1]), "description": row[2]}

            if table_name not in grouped_data:
                grouped_data[table_name] = []

            grouped_data[table_name].append(inner_dict)

    return grouped_data


def escape_single_quotes(input_string):
    return input_string.replace("'", "''")


def new_table(name):
    return f"""
    create table public.atd_txdot__{name}_lkp (
        id serial primary key,
        {name}_id integer not null,
        {name}_desc varchar(255) not null
    );
    """

def main(file_path):
    data = read_and_group_csv(file_path)

    # Pretty-print the grouped data as JSON
    # print(json.dumps(data, indent=4))

    pg = get_pg_connection()
    cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    current_tables = get_current_lkp_tables(pg)
    tables_to_delete = list(set(current_tables) - set(list(data.keys())))

    print(tables_to_delete)

    changes = []
    down_changes = []

    for table in tables_to_delete:
        print("Lookup table ", table, " found in database and not in export")
        drop_table = f"drop table public.{table};"
        changes.append(f"\n-- Dropping table {table}")
        changes.append(drop_table)

    # for table in current_tables:
    #     print(table)
    #     id_col = table.removeprefix("atd_txdot__").replace("lkp", "id")
    #     desc_col = id_col.removesuffix("id") + "desc"
    #     lkp_dict[table] = get_lkp_values(pg, table, id_col, desc_col)
    # print(lkp_dict)

    for table in data:
        name_component = table.removeprefix("atd_txdot__").removesuffix("_lkp")

        print()
        print("👀Looking into table: ", table)

        if table not in current_tables:
            print("💥 Missing table: ", table)
            changes.append(f"\n-- Adding table {table}")
            changes.append(new_table(name_component))
            down_changes.append(f"\n-- Dropping table {table}")
            new_table_down = f"drop table if exists public.{table};"
            down_changes.append(new_table_down)
            for record in data[table]:
                # We do not have a record on file with this ID
                print(f"❓ Id {str(record['id'])} not found in {table_name}")
                print("      CSV Value: ", record["description"])
                print()
                insert = f"insert into public.{table_name} ({name_component}_id, {name_component}_desc) values ({str(record['id'])}, '{escape_single_quotes(record['description'])}');"
                changes.append(insert)
                # Dont need down changes here because the down is just deleting the table

        else:
            # the rest is still a WIP for now
            lkp_dict = get_lkp_values(pg, table, name_component)
            print(lkp_dict, "our values")
            print(data[table], "their values")
            is_first_change = True
            for key in data[table]:
                sql = f"""
                select {name_component}_id as id, {name_component}_desc as description 
                from {table_name} where {name_component}_id = {str(data[table][key])};
                """
                cursor.execute(sql)
                db_result = cursor.fetchone()
                if db_result:
                    # We have a record on file with this ID
                    if db_result["description"] == record["description"]:
                        # print(f"✅ Value \"{record['description']}\" with id {str(record['id'])} found in {table_name}")
                        pass
                    else:
                        print(
                            f"❌ Id {str(record['id'])} found in {table_name} has a description mismatch:"
                        )
                        print("      CSV Value: ", record["description"])
                        print("       DB Value: ", db_result["description"])
                        print()
                        update = f"update public.{table_name} set {name_component}_desc = '{escape_single_quotes(record['description'])}' where {name_component}_id = {str(record['id'])};"
                        if is_first_change == True:
                            changes.append(f"\n-- Changes to table {table_name}")
                            down_changes.append(f"\n-- Changes to table {table_name}")
                        changes.append(update)
                        update_down = f"update public.{table_name} set {name_component}_desc = '{db_result['description']}' where {name_component}_id = {str(record['id'])};"
                        down_changes.append(update_down)
                        is_first_change = False
                else:
                    # We do not have a record on file with this ID
                    # print(f"Value \"{record['description']}\" with id {str(record['id'])} not found in {table_name}")
                    print(f"❓ Id {str(record['id'])} not found in {table_name}")
                    print("      CSV Value: ", record["description"])
                    print()
                    insert = f"insert into public.{table_name} ({name_component}_id, {name_component}_desc) values ({str(record['id'])}, '{escape_single_quotes(record['description'])}');"
                    if is_first_change == True:
                        changes.append(f"\n-- Changes to table {table_name}")
                        down_changes.append(f"\n-- Changes to table {table_name}")
                    changes.append(insert)
                    insert_down = f"delete from public.{table_name} where {name_component}_id = {str(record['id'])};"
                    down_changes.append(insert_down)
                    is_first_change = False

    print("\n🛠️ Here are the changes to be made:\n")
    print("\n".join(changes).strip())

    outfile = open("up_migration.sql", "w")
    outfile.write("\n".join(changes).strip())
    outfile.close()

    outfile_down = open("down_migration.sql", "w")
    outfile_down.write("\n".join(down_changes).strip())
    outfile_down.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", help="extract file path")
    args = parser.parse_args()
    file_path = args.input

    main(file_path)
