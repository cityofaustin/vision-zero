#
# Processes Data from CSV into Postgres
#

import sys
import signal
import json
from process.helpers import generate_gql, record_exists
from process.request import run_query

STOP_EXEC = False

def keyboardInterruptHandler(signal, frame):
    print("KeyboardInterrupt (ID: {}) has been caught. Cleaning up...".format(signal))
    global STOP_EXEC
    STOP_EXEC = True

signal.signal(signal.SIGINT, keyboardInterruptHandler)


FILE_TYPE = sys.argv[1]
FILE_PATH = sys.argv[2]
try:
    FILE_SKIP_ROWS = sys.argv[3]
except:
    FILE_SKIP_ROWS = 0

print("Processing file '%s' of type '%s', skipping: '%s'" % (FILE_PATH, FILE_TYPE, FILE_SKIP_ROWS))

fieldnames = []

records_inserted = 0
existing_records = 0
current_line = 0

skip_rows_parsed = int(FILE_SKIP_ROWS) if FILE_SKIP_ROWS != "" else 0

print("We are skipping: %d" % skip_rows_parsed)

with open(FILE_PATH) as fp:
    line = fp.readline()

    while line:

        if STOP_EXEC:
            exit(1)
        else:
            
            if current_line == 0:
                fieldnames = line.strip().split(",")

            else:
                if skip_rows_parsed != 0 and skip_rows_parsed > current_line:
                    current_line += 1
                    line = fp.readline() # Move pointer to next line
                    continue
                
                crash_id = line.strip().split(",")[0]

                if record_exists(line=line, type=FILE_TYPE):
                    print("[%s] Exists: %s" % (str(current_line), str(crash_id)))
                    existing_records += 1

                else:
                    print("[%s] Inserting: %s" % (str(current_line), str(crash_id)))
                    gql = generate_gql(line=line, fieldnames=fieldnames, type=FILE_TYPE)
                    response = run_query(gql)

                    print(json.dumps(response))

                    if "errors" in response:
                        print(gql)
                        STOP_EXEC=True
                        exit(1)
                    
                    records_inserted += 1

        current_line += 1
        line = fp.readline() # Move pointer to next line


print("Total Existing Records: %s" % (existing_records))
print("Total Records Inserted: %s" % (records_inserted))