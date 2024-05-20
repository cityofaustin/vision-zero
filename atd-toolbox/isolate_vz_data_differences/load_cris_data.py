#!/usr/bin/env python3

import os
import subprocess
import csv
import psycopg2


def generate_pgloader_command(csv_file_path, db_connection_string, table_name):
    print("CSV file path: ", csv_file_path)
    # Read the first line of the CSV file to get the column names
    with open(csv_file_path, "r") as csv_file:
        csv_reader = csv.reader(csv_file)
        headers = next(csv_reader)

    # Generate the pgloader command file content
    pgloader_command = f"""
  LOAD CSV
  FROM '{csv_file_path}'
  INTO {db_connection_string}&data_model.{table_name}
  WITH skip header = 1,
    fields escaped by double-quote,
    fields optionally enclosed by '"'
  BEFORE LOAD DO 
  $$ create table if not exists data_model.{table_name} (
  """
    for header in headers:
        pgloader_command += f"       {header} character varying,\n"
    pgloader_command = pgloader_command.rstrip(",\n") + "\n    );\n$$;\n"

    return pgloader_command


def write_and_execute_pgloader_command(csv_file_path, db_connection_string, output_dir):
    # Get the base name of the CSV file to use as the command file name
    base_name = os.path.basename(csv_file_path)
    table_name = base_name.split("_")[
        3
    ].lower()  # Extract the table name from the filename
    command_file_name = f"{base_name}.load"
    command_file_path = os.path.join(output_dir, command_file_name)

    # Generate the pgloader command
    pgloader_command = generate_pgloader_command(
        csv_file_path, db_connection_string, table_name
    )

    # Write the command to a file
    with open(command_file_path, "w") as command_file:
        command_file.write(pgloader_command)

    # input("Press Enter to continue...")

    # Execute the pgloader command
    subprocess.run(["pgloader", command_file_path])


def process_directory(root_dir, db_connection_string, output_dir):
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".csv"):
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

    process_directory(root_dir, db_connection_string, output_dir)
