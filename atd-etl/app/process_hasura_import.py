#!/usr/bin/env python
"""
Hasura - Import 
Author: Austin Transportation Department, Data and Technology Services

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
records_updated = 0
existing_records = 0
queued_records = 0
insert_errors = 0

# Start timer
start = time.time()


def keyboard_interrupt_handler(signal, frame):
    """
    Handles keyboard interrupts (ie. Control+C) and signals the script to stop.
    :param signal: The signal being caught
    :param frame:
    :return:
    """
    print(
        "KeyboardInterrupt (ID: {}, Frame: {} ) has been caught. Cleaning up...".format(
            signal, frame
        )
    )
    global STOP_EXEC
    STOP_EXEC = True


def process_line(
    file_type, line, fieldnames, current_line, temporary_records, dryrun=False
):
    """
    Will process a single CSV line and will try to check if
    the record already exists and attempt insertion.
    :param str file_type: The file type
    :param str line: The csv line to process
    :param str[] fieldnames: An array of strings container the table headers
    :param int current_line: The current line in the csv being read
    :param str[] temporary_records: Array of strings containing temporary case_ids
    :param bool dryrun: True indicates the line needs to be processed as dry.
    :return:
    """
    # Gather stop signal value
    global STOP_EXEC
    # Do not run if there is stop signal
    if STOP_EXEC:
        return
    global existing_records, records_inserted, insert_errors, records_skipped, queued_records, records_updated
    # Read the crash_id from the current line
    # Applies to: crashes, unit, person, primary person, charges
    crash_id = get_crash_id(line)
    case_id = get_case_id(line)

    mode = "[Dry-Run]" if dryrun else "[Live]"
    compare_enabled = ATD_ETL_CONFIG["ATD_CRIS_IMPORT_COMPARE_FUNCTION"] == "ENABLED"
    # By default enable upserts
    upsert_enabled = True

    # If compare is disabled, then protect existing records.
    if compare_enabled and not dryrun:
        # Compare enabled, and this is a crash
        if file_type == "crash":
            # We have to check if there is a temp record already in the database:
            if case_id in temporary_records:
                # There is, we need to delete it
                print(
                    "Detected temporary record for crash_id/case_id '%s/%s'... deleting!"
                    % (temporary_records[case_id], case_id)
                )
                delete_temp_record(temporary_records[case_id])

            # Does the record exist already?
            record_exists = get_crash_record(crash_id)
            if record_exists:
                existing_records += 1
                # insert_record = False if it was Queued
                # insert_record = True if crash needs updating
                insert_record, feedback_message = record_crash_compare(
                    line=line,
                    fieldnames=fieldnames,
                    crash_id=crash_id,
                    record_existing=record_exists,
                )
                # Print the action to be taken
                print(
                    "%s[%s] %s (type: %s), crash_id: %s"
                    % (
                        mode,
                        str(current_line),
                        feedback_message,
                        file_type,
                        str(crash_id),
                    )
                )
                # If Queued
                if not insert_record:
                    # Update counts and exit
                    if "Queued" in feedback_message:
                        queued_records += 1
                        return
                else:
                    records_updated += 1

        # Compare enabled, this is a secondary record
        else:
            # Is its parent record on queue?
            if is_crash_in_queue(crash_id):
                # Queue this record and exit
                secondary_record_queued = insert_secondary_table_change(
                    line=line, fieldnames=fieldnames, file_type=file_type
                )
                # If Queued
                if secondary_record_queued:
                    print(
                        "%s[%s] Q/A Queued (type: %s), crash_id: %s"
                        % (mode, str(current_line), file_type, str(crash_id))
                    )
                    existing_records += 1
                    queued_records += 1
                    return

        # Compare is enabled, but we reached no exit meaning that
        # that this record needs to be updated (upsert).
        upsert_enabled = True
    else:
        # To force upserts, set 'HASURA_FORCE_UPSERT' to 'ENABLED'
        upsert_enabled = ATD_ETL_CONFIG["HASURA_FORCE_UPSERT"]

    #
    # Follow Normal Process
    #
    # Generate query and present to terminal
    gql = generate_gql(
        line=line, fieldnames=fieldnames, file_type=file_type, upsert=upsert_enabled
    )
    # If this is not a dry-run, then make an actual insertion
    if dryrun:
        # Dry-run, we need a fake response
        response = {"message": "dry run, no record actually inserted"}
    else:
        # Live Execution
        response = run_query(gql)
    # For any other errors, run the error handler hook:
    if "errors" in str(response):
        stop_execution = False
        if "constraint-violation" in str(response):
            records_skipped += 1
            print(
                "%s[%s] Skipped (existing record): %s"
                % (mode, str(current_line), str(crash_id))
            )

        else:
            # Gather from this function if we need to stop the execution.
            stop_execution = handle_record_error_hook(
                line=line,
                gql=gql,
                file_type=file_type,
                response=response,
                line_number=str(current_line),
            )

        # If we are stopping we must make signal of it
        if stop_execution:
            print("----- Crash Insertion Error ------")
            print("Original Line: %s" % line)

            print("%s[%s] Error: %s" % (mode, str(current_line), str(response)))
            print("----------------------------------")

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
        print(
            "%s[%s] Inserted or Updated: %s" % (mode, str(current_line), str(crash_id))
        )
        records_inserted += 1


def process_file(file_path, file_type, skip_lines, dryrun=False):
    """
    It reads an individual CSV file and processes each line into the database.
    :param file_path: string - The full path location of the csv file
    :param file_type: string - The file type: crash, unit, person, primaryperson, charges
    :param skip_lines: int - The number of lines to skip (0 if none)
    :param dryrun: bool - True to enable a dry-run process, or false to run live.
    :return:
    """
    FILE_PATH = file_path
    FILE_TYPE = file_type
    FILE_SKIP_ROWS = skip_lines
    current_file_skipped_lines = 0
    max_threads = ATD_ETL_CONFIG["MAX_THREADS"]

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
    print(
        "Processing file '%s' of type '%s', skipping: '%s'"
        % (FILE_PATH, FILE_TYPE, FILE_SKIP_ROWS)
    )
    print("Endpoint: %s" % ATD_ETL_CONFIG["HASURA_ENDPOINT"])
    print("Max Threads: %s" % max_threads)
    print("Dry-run mode enabled: %s" % str(dryrun))
    print("Compare-function: %s" % ATD_ETL_CONFIG["ATD_CRIS_IMPORT_COMPARE_FUNCTION"])
    print("------------------------------------------")
    # Current line tracker
    current_line = 0

    # This array stores the header names taken from the CSV file,
    # this will later be used to generate our graphql queries.
    fieldnames = []
    temporary_records = []

    # This will hold the official number of rows being skipped, just to be safe.
    # If FILE_SKIP_ROWS contains no value, assumes 0 rows to be skipped.
    skip_rows_parsed = int(FILE_SKIP_ROWS) if FILE_SKIP_ROWS != "" else 0

    # We proceed as normal
    print(
        "We are skipping: %s"
        % (str(skip_rows_parsed) if skip_rows_parsed >= 0 else "all records")
    )

    if file_type == "crash":
        temporary_records = get_list_temp_records()

    # Open FILE_PATH as a file pointer:
    with open(FILE_PATH) as fp:
        # Read first line
        line = fp.readline()

        # Then read the first line
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_threads) as executor:

            # While we haven't reached the EOF
            while line:
                if current_line == 0:
                    # Then split each word and use as field names for our GraphQL query
                    fieldnames = line.strip().split(",")
                else:
                    # Skipping `skip_rows_parsed` number of lines
                    if (skip_rows_parsed != 0 and skip_rows_parsed >= current_line) or (
                        skip_rows_parsed == -1
                    ):
                        current_line += 1
                        records_skipped += 1
                        current_file_skipped_lines += 1
                        line = fp.readline()  # Move pointer to next line
                        continue

                    # Process The Line, if no interrupt in place
                    if not STOP_EXEC:
                        # Allow time for an interrupt to take place
                        time.sleep(0.01)

                        # Submit thread to executor
                        executor.submit(
                            process_line,
                            FILE_TYPE,
                            line,
                            fieldnames,
                            current_line,
                            temporary_records,
                            dryrun,
                        )

                # Keep adding to current line
                current_line += 1

                # Move pointer to next line
                line = fp.readline()

    if skip_lines == -1:
        print("Skipped lines for this file: %s" % current_file_skipped_lines)

    # Calculate and display the time it took for this specific file
    local_timer_end = time.time()
    local_timer_hours, local_timer_rem = divmod(
        local_timer_end - local_timer_start, 3600
    )
    local_timer_minutes, local_timer_seconds = divmod(local_timer_rem, 60)
    print(
        "Current file finished in: {:0>2}:{:0>2}:{:05.2f}".format(
            int(local_timer_hours), int(local_timer_minutes), local_timer_seconds
        )
    )

    print("------------------------------------------")
    print("Overall:")
    print("Total Skipped Records: %s" % (records_skipped))
    print("Total Existing Records: %s" % (existing_records))
    print("Total Records Inserted: %s" % (records_inserted))
    print("Total Records Updated: %s" % (records_updated))
    print("Total Records Queued: %s" % (queued_records))

    print("Total Errors: %s" % (insert_errors))
    print("")


# We register our handler in the interrupt hook
signal.signal(signal.SIGINT, keyboard_interrupt_handler)

print("Running import script, gathering configuration.")
IMPORT_CONFIG = generate_run_config()

print("Processing Files: ")
for FILE in IMPORT_CONFIG["file_list"]:
    process_file(
        file_type=IMPORT_CONFIG["file_type"],
        file_path=FILE["file"],
        skip_lines=FILE["skip"],
        dryrun=IMPORT_CONFIG["file_dryrun"],
    )


# Calculate & print overall time
end = time.time()
hours, rem = divmod(end - start, 3600)
minutes, seconds = divmod(rem, 60)
print(
    "Overall process finished in: {:0>2}:{:0>2}:{:05.2f}".format(
        int(hours), int(minutes), seconds
    )
)
