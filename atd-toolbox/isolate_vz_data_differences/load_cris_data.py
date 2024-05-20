#!/usr/bin/env python3

import os
import subprocess
import csv
import psycopg2


# Global dictionary to store tables and their columns
tables_columns = {}


def generate_pgloader_command(csv_file_path, db_connection_string, table_name):
    print("CSV file path:", csv_file_path)
    # Read the first line of the CSV file to get the column names
    with open(csv_file_path, "r") as csv_file:
        csv_reader = csv.reader(csv_file)
        headers = next(csv_reader)

    # Check if there are any new columns
    new_columns = []
    if table_name in tables_columns:
        new_columns = set(headers) - set(tables_columns[table_name])
        if new_columns:
            print(f"New columns in {table_name}: {', '.join(new_columns)}")
            tables_columns[table_name].extend(new_columns)
    else:
        tables_columns[table_name] = headers

    # Generate the pgloader command file content
    pgloader_command = f"""
LOAD CSV
FROM '{csv_file_path}'
INTO {db_connection_string}&data_model.{table_name}
WITH skip header = 1,
fields optionally enclosed by '"'

BEFORE LOAD DO
$$
CREATE TABLE IF NOT EXISTS data_model.{table_name} (
"""
    #  fields escaped by double-quote,

    for header in headers:
        pgloader_command += f"    {header} character varying,\n"
    pgloader_command = pgloader_command.rstrip(",\n") + "\n);\n$$"

    # Add ALTER TABLE commands for new columns
    for column in new_columns:
        pgloader_command += f", $$\nALTER TABLE data_model.{table_name} ADD COLUMN IF NOT EXISTS {column} character varying;\n$$"

    pgloader_command += ";\n"

    return pgloader_command


def write_and_execute_pgloader_command(csv_file_path, db_connection_string, output_dir):
    # Get the base name of the CSV file to use as the command file name
    base_name = os.path.basename(csv_file_path)
    table_name = base_name.split("_")[
        3
    ].lower()  # Extract the table name from the filename
    if table_name != "unit":
        return
    command_file_name = f"{base_name}.load"
    command_file_path = os.path.join(output_dir, command_file_name)

    print("\n\n\n")

    # Generate the pgloader command
    pgloader_command = generate_pgloader_command(
        csv_file_path, db_connection_string, table_name
    )

    # Write the command to a file
    print("Writing pgloader command to:", command_file_path)
    with open(command_file_path, "w") as command_file:
        command_file.write(pgloader_command)

    # input("Press Enter to continue...")
    try:
        # Execute the pgloader command
        subprocess.run(["pgloader", command_file_path], check=True)
    except subprocess.CalledProcessError as e:
        raise Exception(
            "pgloader command failed with exit status: {}".format(e.returncode)
        )


def process_directory(root_dir, db_connection_string, output_dir, only_file=None):
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".csv") and (only_file is None or file == only_file):
                csv_file_path = os.path.join(subdir, file)
                write_and_execute_pgloader_command(
                    csv_file_path, db_connection_string, output_dir
                )


def drop_tables(db_connection_string):
    # List of tables to drop
    tables = [
        "charges",
        "crash",
        "damages",
        "endorsements",
        "lookup",
        "person",
        "primaryperson",
        "restrictions",
        "unit",
    ]

    # Connect to the database
    with psycopg2.connect(db_connection_string) as conn:
        with conn.cursor() as cur:
            for table in tables:
                # Execute the SQL command to drop the table
                cur.execute(f"DROP TABLE IF EXISTS data_model.{table};")
        conn.commit()


if __name__ == "__main__":
    root_dir = "/app/extracts"
    output_dir = "/app/load_files"

    # Get the database connection string from the environment variable
    db_connection_string = os.getenv("DATABASE_CONNECTION")

    if db_connection_string is None:
        raise EnvironmentError("DATABASE_CONNECTION environment variable is not set")

    drop_tables(db_connection_string)

    only_file = None
    # only_file = (
    #     "extract_2018_20240516104535_unit_20200101-20201231_HAYSTRAVISWILLIAMSON.csv"
    # )
    process_directory(root_dir, db_connection_string, output_dir, only_file)
