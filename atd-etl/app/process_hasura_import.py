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

import sys
import signal
import json
import glob
import concurrent.futures

# Setting up a concurrency of 10 max_threads, that should be enough.
# We will need to test how much more ESRI will allow us to run reliably.
#
# with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
# 	executor.map(process_crash, crash_data['data']['atd_txdot_crashes'])
# with ThreadPoolExecutor(max_workers=1) as executor:
#     future = executor.submit(pow, 323, 1235)
#     print(future.result())

# We need to import our configuration, helpers and request methods
from process.config import ATD_ETL_CONFIG
from process.helpers import *
from process.request import *


# Global Variable to signal execution stop
STOP_EXEC = False


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


# We register our handler in the interrupt hook
signal.signal(signal.SIGINT, keyboard_interrupt_handler)


# First the file type, ie: 'crash', 'charges', 'units', 'person' or 'primary person'.
# This string must match with the export_*.csv file name.
FILE_TYPE = str(sys.argv[1]).lower()

# We also need to know the exact location of the file we are currently processing.
FILE_PATH = sys.argv[2]

try:
    # The user should also be able to specify how many rows to skip on the 3rd argument
    FILE_SKIP_ROWS = sys.argv[3]
except:
    # Otherwise, skip none.
    FILE_SKIP_ROWS = 0


# Print what we are currently doing, and where we are going to insert data.
print("Processing file '%s' of type '%s', skipping: '%s'" % (FILE_PATH, FILE_TYPE, FILE_SKIP_ROWS))
print("Endpoint: %s" % ATD_ETL_CONFIG["HASURA_ENDPOINT"])

# We need counts of the
records_inserted = 0
existing_records = 0
insert_errors = 0
current_line = 0

# This array stores the header names taken from the CSV file,
# this will later be used to generate our graphql queries.
fieldnames = []

# This will hold the official number of rows being skipped, just to be safe.
# If FILE_SKIP_ROWS contains no value, assumes 0 rows to be skipped.
skip_rows_parsed = int(FILE_SKIP_ROWS) if FILE_SKIP_ROWS != "" else 0
print("We are skipping: %d" % skip_rows_parsed)

# Open FILE_PATH as a file pointer:
with open(FILE_PATH) as fp:
    # Then read the first line
    line = fp.readline()

    # While we haven't reached the EOF
    while line:
        # Check if there is a keyboard interrupt, exit if so.
        if STOP_EXEC:
            exit(1)
        else:
            # If this is the first line
            if current_line == 0:
                # Then split each word and use as field names for our GraphQL query
                fieldnames = line.strip().split(",")

            # This is another
            else:
                #
                # Skipping `skip_rows_parsed` number of lines
                #
                if skip_rows_parsed != 0 and skip_rows_parsed > current_line:
                    current_line += 1
                    line = fp.readline() # Move pointer to next line
                    continue

                #
                # Not skipping
                #

                # Read the crash_id from the current line
                # Applies to: crashes, unit, person, primary person, charges
                crash_id = line.strip().split(",")[0]

                # First we need to check if the current record exists, skip if so.
                if record_exists_hook(line=line, type=FILE_TYPE):
                    print("[%s] Exists: %s (%s)" % (str(current_line), str(crash_id), FILE_TYPE))
                    existing_records += 1

                # The record does not exist, insert.
                else:
                    print("[%s] Inserting: %s" % (str(current_line), str(crash_id)))
                    gql = generate_gql(line=line, fieldnames=fieldnames, type=FILE_TYPE)
                    print("GQL: " + gql)
                    #response = run_query(gql)

                    response = {
                        "errors": "Made up!"
                    }

                    print(json.dumps(response))

                    # If there is an error, run the hook.
                    if "errors" in response:
                        insert_errors += 1
                        # Gather from this function if we need to stop the execution.
                        stop_execution = handle_record_error_hook(line=line, gql=gql, type=FILE_TYPE)
                        if stop_execution:
                            STOP_EXEC = True
                            exit(1)


                    records_inserted += 1

        current_line += 1
        line = fp.readline()  # Move pointer to next line


print("Total Existing Records: %s" % (existing_records))
print("Total Records Inserted: %s" % (records_inserted))
print("Total Errors: %s" % (insert_errors))
print("")
