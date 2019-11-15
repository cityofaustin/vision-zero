#!/usr/bin/env python
"""
Hasura - Import
Author: Austin Transportation Department, Data and Technology Office

Description: The purpose of this script is to import CSV files from
the data extract. It assumes the files are available in the /data folder
of whatever environment this script runs. Each CSV file is transformed
into a GraphQL query and it is inserted in the database via Hasura.

Important: It assumes the files are available in the /data folder
of whatever environment this script runs. Be sure to provide the
/data folder by mounting a volume with Docker.

The application requires the requests library:
    https://pypi.org/project/requests/
"""
import time
import signal
import json
import concurrent.futures

# We need to import our configuration, helpers and request methods
from process.config import ATD_ETL_CONFIG
from process.request import *
from process.helpers_import import *


# Global Variable to signal execution stop
STOP_EXEC = False

# We need global counts:
records_skipped = 0
records_inserted = 0
existing_records = 0
insert_errors = 0

def keyboard_interrupt_handler(signal, frame):
    """
    Handles keyboard interrputs (ie. Control+C) and signals the script to stop.
    :param signal: The signal being caught
    :param frame:
    :return:
    """
    print("KeyboardInterrupt (ID: {}, Frame: {} ) has been caught. Cleaning up...".format(signal, frame))
    global STOP_EXEC
    STOP_EXEC = True


def process_line(file_type, line, fieldnames, current_line, dryrun=False):
    """
    Will process a single CSV line and will try to check if
    the record already exists and attempt insertion.
    :param file_type: string - the file type
    :param line: string - the csv line to process
    :param fieldnames: array of strings - an array of strings container the table headers
    :param current_line: int - the current line in the csv being read
    :return:
    """
    global STOP_EXEC
    if STOP_EXEC:
        print("Stop signal detected.")
        exit(1)

    global existing_records, records_inserted, insert_errors
    # Read the crash_id from the current line
    # Applies to: crashes, unit, person, primary person, charges
    crash_id = line.strip().split(",")[0]

    # First we need to check if the current record exists, skip if so.
    if record_exists_hook(line=line, type=file_type):
        print("[%s] Exists: %s (%s)" % (str(current_line), str(crash_id), file_type))
        existing_records += 1

    # The record does not exist, insert.
    else:
        # Generate query and present to terminal
        gql = generate_gql(line=line, fieldnames=fieldnames, type=file_type)
        print("[%s] Inserting: %s \n %s \n" % (str(current_line), str(crash_id), gql))

        # Make actual Insertion
        if dryrun:
            print("\t[Dry-run] Inserting: %s" + gql)
            response = {
                "message": "dry run, no record actually inserted"
            }
        else:
            #response = run_query(gql)
            print("Whaddup")

        print("[%s] Response: %s \n %s \n" % (str(current_line), str(crash_id), json.dumps(response)))

        # If there is an error, run the hook.
        if "errors" in response:
            # Gather from this function if we need to stop the execution.
            stop_execution = handle_record_error_hook(line=line, gql=gql, type=file_type)
            if stop_execution:
                print(json.dumps(response))
                insert_errors += 1
                STOP_EXEC = True
                exit(1)

        # Record Inserted
        records_inserted += 1


def process_file(file_path, file_type, skip_lines, dryrun=False):
    """
    It reads an individual CSV file and processes each line into the database.
    :param file_path: string - the full path location of the csv file
    :param file_type: string - the file type: crash, unit, person, primaryperson, charges
    :param skip_lines: int - the number of lines to skip (0 if none)
    :return:
    """
    FILE_PATH = file_path
    FILE_TYPE = file_type
    FILE_SKIP_ROWS = skip_lines

    global STOP_EXEC, records_skipped

    # Print what we are currently doing, and where we are going to insert data.
    print("\n\n------------------------------------------")
    print("Processing file '%s' of type '%s', skipping: '%s'" % (FILE_PATH, FILE_TYPE, FILE_SKIP_ROWS))
    print("Endpoint: %s" % ATD_ETL_CONFIG["HASURA_ENDPOINT"])
    print("Dry-run mode enabled: " + str(dryrun))
    print("------------------------------------------")
    # Current line tracker
    current_line = 0

    # This array stores the header names taken from the CSV file,
    # this will later be used to generate our graphql queries.
    fieldnames = []

    # This will hold the official number of rows being skipped, just to be safe.
    # If FILE_SKIP_ROWS contains no value, assumes 0 rows to be skipped.
    skip_rows_parsed = int(FILE_SKIP_ROWS) if FILE_SKIP_ROWS != "" else 0

    # We proceed as normal
    print("We are skipping: %s" % (str(skip_rows_parsed) if skip_rows_parsed >= 0 else "all records"))

    # Open FILE_PATH as a file pointer:
    with open(FILE_PATH) as fp:
        # Read first line
        line = fp.readline()

        # Then read the first line
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:

            # While we haven't reached the EOF
            while line:
                if current_line == 0:
                    # Then split each word and use as field names for our GraphQL query
                    fieldnames = line.strip().split(",")
                else:
                    # Skipping `skip_rows_parsed` number of lines
                    if (skip_rows_parsed != 0 and skip_rows_parsed >= current_line) or (skip_rows_parsed == -1):
                        current_line += 1
                        records_skipped += 1
                        line = fp.readline()  # Move pointer to next line
                        continue

                    # Process The Line, if no interrupt in place
                    if not(STOP_EXEC):
                        # Allow time for an interrupt to take place
                        time.sleep(.01)

                        # Submit thread to executor
                        executor.submit(process_line, FILE_TYPE, line, fieldnames, current_line, dryrun)

                # Keep adding to current line
                current_line += 1
                # Move pointer to next line
                line = fp.readline()
    print("------------------------------------------")
    print("Overall thus far:")
    print("Total Skipped Records: %s" % (records_skipped))
    print("Total Existing Records: %s" % (existing_records))
    print("Total Records Inserted: %s" % (records_inserted))
    print("Total Errors: %s" % (insert_errors))
    print("")


# We register our handler in the interrupt hook
signal.signal(signal.SIGINT, keyboard_interrupt_handler)

print("Running import script, gathering configuration.")
IMPORT_CONFIG = generate_run_config()

print("Processing Files: ")
for FILE in IMPORT_CONFIG["file_list"]:
    process_file(file_type=IMPORT_CONFIG["file_type"], file_path=FILE["file"], skip_lines=FILE["skip"], dryrun=IMPORT_CONFIG["file_dryrun"])