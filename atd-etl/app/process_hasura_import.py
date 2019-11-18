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
import logging
import concurrent.futures

# We need to import our configuration, helpers and request methods
from process.config import ATD_ETL_CONFIG
from process.request import *
from process.helpers_import import *

# Disable logging
logging.getLogger().setLevel(logging.CRITICAL)

# Global Variable to signal execution stop
STOP_EXEC = False

# We need global counts:
records_skipped = 0
records_inserted = 0
existing_records = 0
insert_errors = 0

# Start timer
start = time.time()

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
    # Gather stop signal value
    global STOP_EXEC
    # Do not run if there is stop signal
    if STOP_EXEC:
        return

    global existing_records, records_inserted, insert_errors, records_skipped
    # Read the crash_id from the current line
    # Applies to: crashes, unit, person, primary person, charges
    crash_id = line.strip().split(",")[0]
    mode = "[Dry-Run]" if dryrun else "[Live]"
    # First we need to check if the current record exists, skip if so.
    if record_exists_hook(line=line, type=file_type):
        print("[%s] Exists: %s (%s)" % (str(current_line), str(crash_id), file_type))
        existing_records += 1

    # The record does not exist, insert.
    else:
        # Generate query and present to terminal
        gql = generate_gql(line=line, fieldnames=fieldnames, type=file_type)

        # If this is not a dry-run, then make an actual insertion
        if dryrun:
            # Dry-run, we need a fake response
            response = {
                "message": "dry run, no record actually inserted"
            }
        else:
            # Live Execution
            response = run_query(gql)

        # For any other errors, run the error handler hook:
        if "errors" in str(response):
            stop_execution = False
            if "constraint-violation" in str(response):
                records_skipped += 1
                print("%s[%s] Skipped (existing record): %s" %
                      (mode, str(current_line), str(crash_id)))

            else:
                # Gather from this function if we need to stop the execution.
                stop_execution = handle_record_error_hook(line=line, gql=gql, type=file_type,
                                                          response=response, line_number=str(current_line))

            # If we are stopping we must make signal of it
            if stop_execution:
                insert_errors += 1
                STOP_EXEC = True
                exit(1)
                time.sleep(1)
            # If we are not stopping execution, we are skipping the record
            else:
                existing_records += 1
        # If no errors, then we did insert the record successfully
        else:
            # An actual insertion was made
            print("%s[%s] Inserted: %s" %
                  (mode, str(current_line), str(crash_id)))
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
    current_file_skipped_lines = 0

    # Start a local timer
    local_timer_start = time.time()

    # Gather stop signal and records skipped
    global STOP_EXEC, records_skipped

    # Do not run if there is stop signal
    if STOP_EXEC:
        print("process_file(): Stop signal detected.")
        exit(1)
        return

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
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:

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
                        current_file_skipped_lines += 1
                        line = fp.readline()  # Move pointer to next line
                        continue

                    # Process The Line, if no interrupt in place
                    if not STOP_EXEC:
                        # Allow time for an interrupt to take place
                        time.sleep(.01)

                        # Submit thread to executor
                        executor.submit(process_line, FILE_TYPE, line, fieldnames, current_line, dryrun)

                # Keep adding to current line
                current_line += 1

                # Move pointer to next line
                line = fp.readline()

    if skip_lines == -1:
        print("Skipped lines for this file: %s" % current_file_skipped_lines)

    # Calculate and display the time it took for this specific file
    local_timer_end = time.time()
    local_timer_hours, local_timer_rem = divmod(local_timer_end - local_timer_start, 3600)
    local_timer_minutes, local_timer_seconds = divmod(local_timer_rem, 60)
    print("Current file finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(local_timer_hours), int(local_timer_minutes), local_timer_seconds))

    print("------------------------------------------")
    print("Overall:")
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
    process_file(file_type=IMPORT_CONFIG["file_type"],
                 file_path=FILE["file"],
                 skip_lines=FILE["skip"],
                 dryrun=IMPORT_CONFIG["file_dryrun"])


# Calculate & print overall time
end = time.time()
hours, rem = divmod(end-start, 3600)
minutes, seconds = divmod(rem, 60)
print("Overall process finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours),int(minutes),seconds))