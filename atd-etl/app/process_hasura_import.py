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

# Secondly, we need to know how many rows to skip
try:
    # The user should also be able to specify how many rows to skip on the 3rd argument
    FILE_SKIP_ROWS = sys.argv[2]
except:
    # Otherwise, skip none.
    FILE_SKIP_ROWS = 0

if FILE_TYPE == "":
    print("No File Type provided")
    exit(1)


for
FILE_LIST = glob.glob("/data/extract_*%s*.csv" % FILE_TYPE)

for CURRENT_FILE in FILE_LIST:
    print("Processing file: '%s'" % CURRENT_FILE)

    print("Skipping Lines: %s" % FILE_SKIP_ROWS)



