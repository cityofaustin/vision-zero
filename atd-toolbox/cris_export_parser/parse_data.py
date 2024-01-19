#!/usr/bin/env python3

import csv
import argparse


def parse_csv(file_path, field_names, substrings):
    with open(file_path, "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            for field in field_names:
                if field in row:
                    for substring in substrings:
                        if substring.lower() in row[field].lower():
                            print(
                                {
                                    "Crash_ID": row.get("Crash_ID", ""),
                                    "Prsn_Nbr": row.get("Prsn_Nbr", ""),
                                    "Prsn_Name": f"{row.get('Prsn_First_Name', '')} {row.get('Prsn_Last_Name', '')}",
                                    "Drvr_City_Name": row.get("Drvr_City_Name", ""),
                                    "Drvr_Street_Name": row.get("Drvr_Street_Name", ""),
                                }
                            )
                            break


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
