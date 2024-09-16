#!/usr/bin/env python3

import csv
import argparse
import psycopg2
import psycopg2.extras
import time

conn = psycopg2.connect(
    dbname="atd_vz_data",
    user="visionzero",
    password="visionzero",
    host="localhost",
    port="5432",
)


def parse_csv(file_path, field_names, substrings):
    with open(file_path, "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            for field in field_names:
                # Check if field is in row and not None
                if field in row and row[field] is not None:
                    fieldValue = row[field]  # Store the field value
                    for substring in substrings:
                        if substring.lower() in fieldValue.lower():
                            if not (
                                "Crash_ID" in row
                                and "Unit_Nbr" in row
                                and "Prsn_Nbr" in row
                            ):
                                continue

                            with conn.cursor(
                                cursor_factory=psycopg2.extras.RealDictCursor
                            ) as cur:
                                # Use the cursor here

                                count = f"""
select count(*) as count
from atd_txdot_primaryperson
where true
and crash_id = {row.get("Crash_ID")} 
and unit_nbr = {row.get("Unit_Nbr")}
and prsn_nbr = {row.get("Prsn_Nbr")};"""

                                cur.execute(count)
                                count_check = cur.fetchone()
                                print("row count: ", count_check["count"])
                                if not count_check["count"] == 1:
                                    print(
                                        {
                                            "Crash_ID": row.get("Crash_ID"),
                                            "Prsn_Nbr": row.get("Unit_Nbr"),
                                            "Prsn_Name": f"{row.get('Prsn_First_Name')} {row.get('Prsn_Last_Name')}",
                                            "Drvr_City_Name": row.get("drvr_city_name"),
                                            "Drvr_Street_Name": row.get(
                                                "drvr_street_name"
                                            ),
                                        }
                                    )
                                    continue
                                print("would update here...")

                                update = f"""
update atd_txdot_primaryperson
set peh_fl = true
where true
and crash_id = {row.get("Crash_ID")} 
and unit_nbr = {row.get("Unit_Nbr")}
and prsn_nbr = {row.get("Prsn_Nbr")};"""

                                print(update)
                                cur.execute(update)
                                conn.commit()


def main():
    parser = argparse.ArgumentParser(description="Parse a CSV file.")
    parser.add_argument("-i", "--input", help="Input file path", required=True)
    args = parser.parse_args()

    fields = [
        "Drvr_Street_Nbr",
        "Drvr_Street_Pfx",
        "Drvr_Street_Name",  # This is the one that has it in primary persons
        "Drvr_Street_Sfx",
        "Drvr_Apt_Nbr",
        "Drvr_City_Name",
        "Drvr_State_ID",
        "Drvr_Zip",
    ]
    parse_csv(args.input, fields, ["homeless", "unhoused", "transient"])


if __name__ == "__main__":
    main()
