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

#
# Now we import Splinter-related libraries
#
from splinter import Browser
from selenium.webdriver.chrome.options import Options


def wait(int):
    print("Should wait: %s" % str(int))
    time.sleep(int)


# Start timer
start = time.time()

#
# We need to initialize our browser with the following options
#
print("Initializing browser options.")
chrome_options = Options()
chrome_options.add_argument('--headless')  # We don't need to run xvfb (X Virtual Frame-buffer)
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument("--window-size=1920,1080")  # CRIS will not render in small resolutions
print("Initializing Chrome headless browser.")
browser = Browser('chrome', options=chrome_options)

# Visit CRIS
print("Logging in to '%s'" % ATD_ETL_CONFIG["ATD_CRIS_WEBSITE"])
browser.visit(ATD_ETL_CONFIG["ATD_CRIS_WEBSITE"])

# Select the agency, then click Continue
print("Filling out agency.")
browser.find_by_id('idpSelectSelectButton').click()
browser.find_by_id("idpSelectInput").fill(
    "** Texas Department of Transportation - External Agencies"
)
browser.find_by_id("idpSelectSelectButton").click()

# We log in
wait(10)
print("Filling out credentials.")
browser.find_by_id('username').fill(ATD_ETL_CONFIG["ATD_CRIS_USERNAME_CR3"])
browser.find_by_id('password').fill(ATD_ETL_CONFIG["ATD_CRIS_PASSWORD_CR3"])
browser.find_by_name('_eventId_proceed').click()

# At this point, we have all we need from the browser, the cookies:
print("Gathering cookies.")
CRIS_BROWSER_COOKIES = browser.cookies.all()

#
# We now need to request a list of N number of records
# that do not have a CR3. For each record we must download
# the CR3 pdf, upload to S3
#
print("Preparing download loop.")

print("Gathering list of crashes.")
crashes_list = []
try:
    print("Hasura endpoint: '%s' " % ATD_ETL_CONFIG["HASURA_ENDPOINT"])
    downloads_per_run = ATD_ETL_CONFIG["ATD_CRIS_CR3_DOWNLOADS_PER_RUN"]
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
