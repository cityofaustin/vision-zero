#!/usr/bin/env python
"""
CRIS - CR3 Downloader
Author: Austin Transportation Department, Data and Technology Services

Description: This script allows the user to log in to the CRIS website
and download CR3 pdf files as needed. The list of CR3 files to be downloaded
is obtained from Hasura, and it is contingent to records that do not have
any CR3 files associated.

The application requires the splinter library, and the requests library:
    https://splinter.readthedocs.io/en/latest/
"""

import time
import json
import concurrent.futures

from process.config import ATD_ETL_CONFIG
from process.helpers_cr3 import *

def wait(int):
    print("Should wait: %s" % str(int))
    time.sleep(int)


# Start timer
start = time.time()

#
# We now need to request a list of N number of records
# that do not have a CR3. For each record we must download
# the CR3 pdf, upload to S3
#

# ask user for a set of valid cookies for requests to the CRIS website
CRIS_BROWSER_COOKIES = input('Please login to CRIS and extract the contents of the Cookie: header and please paste it here:')

print("Preparing download loop.")

print("Gathering list of crashes.")
crashes_list = []
try:
    print("Hasura endpoint: '%s' " % ATD_ETL_CONFIG["HASURA_ENDPOINT"])
    downloads_per_run = ATD_ETL_CONFIG["ATD_CRIS_CR3_DOWNLOADS_PER_RUN"]
    downloads_per_run = 2000
    print("Downloads Per This Run: %s" % str(downloads_per_run))

    response = get_crash_id_list(downloads_per_run=downloads_per_run)
    print("\nResponse from Hasura: %s" % json.dumps(response))

    crashes_list = response['data']['atd_txdot_crashes']
    print("\nList of crashes: %s" % json.dumps(crashes_list))
 
    print("\nInitializing Execution Thread Pool:")
except Exception as e:
    crashes_list = []
    print("Error, could not run CR3 processing: " + str(e))

with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
    for crash_record in crashes_list:
        executor.submit(process_crash_cr3, crash_record, CRIS_BROWSER_COOKIES)

print("\nProcess done.")

end = time.time()
hours, rem = divmod(end-start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours),int(minutes),seconds))