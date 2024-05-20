#!/usr/bin/env python3

import os
import subprocess
import csv
import psycopg2

# Global dictionary to store tables and their columns
tables_columns = {}


def process_file(csv_file_path, db_connection_string, output_dir):
    # Get the base name of the CSV file to use as the command file name
    base_name = os.path.basename(csv_file_path)
    table_name = base_name.split("_")[3].lower()
    if table_name != "unit":
        return

    with open(csv_file_path, "r") as csv_file:
        csv_reader = csv.reader(csv_file)
        headers = [header.lower() for header in next(csv_reader)]
        # Update the global dictionary if new headers are found
        if table_name not in tables_columns:
            tables_columns[table_name] = headers
        # else:
        #     for header in headers:
        #         if header not in tables_columns[table_name]:
        #             tables_columns[table_name].append(header)

        # Establish a connection to the database
        with psycopg2.connect(db_connection_string) as conn:
            # Create a cursor object
            with conn.cursor() as cur:
                # Check if the table exists
                cur.execute(
                    f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE  table_schema = 'data_model' 
                        AND    table_name   = '{table_name.lower()}'
                    );
                    """
                )
                table_exists = cur.fetchone()[0]

                if not table_exists:
                    # This is the first time we're seeing this table, so create it
                    columns = ", ".join(f'"{header}" VARCHAR' for header in headers)
                    create_table_query = f"CREATE TABLE IF NOT EXISTS data_model.{table_name} ({columns});"
                    print("Creating table", table_name)
                    cur.execute(create_table_query)
                else:
                    # We've seen this table before, so check if there are any new columns
                    new_columns = [
                        header
                        for header in headers
                        if header not in tables_columns[table_name]
                    ]
                    for new_column in new_columns:
                        alter_table_query = f"ALTER TABLE data_model.{table_name} ADD COLUMN {new_column} VARCHAR;"
                        print(f"Adding column {new_column} to table {table_name}")
                        tables_columns[table_name].append(new_column)
                        cur.execute(alter_table_query)
                conn.commit()

            with conn.cursor() as cur:
                for row in csv_reader:
                    row_dict = dict(zip(headers, row))

                    # Construct the INSERT INTO SQL query
                    columns = ", ".join(row_dict.keys())
                    placeholders = ", ".join(["%s"] * len(row_dict))
                    insert_query = f"INSERT INTO data_model.{table_name} ({columns}) VALUES ({placeholders});"

                    # Execute the SQL query
                    cur.execute(insert_query, list(row_dict.values()))

                conn.commit()


def process_directory(root_dir, db_connection_string, output_dir, only_file=None):
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".csv") and (only_file is None or file == only_file):
                csv_file_path = os.path.join(subdir, file)
                process_file(csv_file_path, db_connection_string, output_dir)


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
                print(f"Dropping table data_model.{table}")
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
