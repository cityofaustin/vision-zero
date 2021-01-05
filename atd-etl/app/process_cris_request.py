#!/usr/bin/env python
"""
CRIS - Request Script
Author: Austin Transportation Department, Data and Technology Services

Description: This script allows the user to request new CSV data extracts.
It will sign-in to the CRIS website, and given date parameters, it will
fill out the form and request the extract step-by-step.

The application requires the splinter library:
    https://splinter.readthedocs.io/en/latest/
"""

import time
import datetime
import dateutil.relativedelta

from process.config import ATD_ETL_CONFIG
from process.helpers_cr3 import *

#
# Now we import Splinter-related libraries
#
from splinter import Browser
from selenium.webdriver.chrome.options import Options
import web_pdb


def wait(int):
    print("Should wait: %s" % str(int))
    time.sleep(int)


# Start timer
start = time.time()

# Report Dates
date_now = datetime.datetime.now()
date_month_ago = date_now + dateutil.relativedelta.relativedelta(days=-3)
CRIS_EXTRACT_DATE_START = date_month_ago.strftime("%m/%d/%Y")
CRIS_EXTRACT_DATE_END = date_now.strftime("%m/%d/%Y")

#
# We need to initialize our browser with the following options
#
print("Initializing browser options.")
chrome_options = Options()
chrome_options.add_argument(
    "--headless"
)  # We don't need to run xvfb (X Virtual Frame-buffer)
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument(
    "--window-size=1920,1080"
)  # CRIS will not render in small resolutions
print("Initializing Chrome headless browser.")
browser = Browser("chrome", options=chrome_options)

# Visit CRIS
print("Logging in to '%s'" % ATD_ETL_CONFIG["ATD_CRIS_WEBSITE"])
browser.visit(ATD_ETL_CONFIG["ATD_CRIS_WEBSITE"])

# Select the agency, then click Continue
print("Filling out agency.")
browser.find_by_id("idpSelectInput").fill(
    "** Texas Department of Transportation - External Agencies"
)
browser.find_by_id("idpSelectSelectButton").click()

# We log in
print("Filling out credentials.")
browser.find_by_id("username").fill(ATD_ETL_CONFIG["ATD_CRIS_REQUEST_USERNAME"])
browser.find_by_id("password").fill(ATD_ETL_CONFIG["ATD_CRIS_REQUEST_PASSWORD"])
browser.find_by_name("_eventId_proceed").click()


# Let's begin our data extract request
print(
    "Selecting data extract request, from '%s' to '%s'"
    % (CRIS_EXTRACT_DATE_START, CRIS_EXTRACT_DATE_END)
)

wait(10)
start_button = browser.find_by_text("Create Data Extract Request")
start_button.click()
wait(10)

browser.find_by_text("Next").click()
wait(10)

print("Selecting Counties to be Included in the Extract")
browser.find_by_id("rdoCounties").click()
# Open ng-select dropdown
browser.find_by_id("requestCounties").click()

browser.find_by_text("TRAVIS").click()

# Reopen dropdown
browser.find_by_id("requestCounties").click()
browser.find_by_text("WILLIAMSON").click()

# Reopen dropdown
browser.find_by_id("requestCounties").click()
browser.find_by_text("HAYS").click()
wait(3)

browser.find_by_text("Next").click()
wait(10)

print("Selecting type IDS PROCESS")
browser.find_by_id("rdoProcessDates").click()
# browser.find_by_css('input[ng-value="shareConstants.DATE_TYPE_IDS.PROCESS"]').click()
browser.find_by_id("requestDateProcessBegin").fill(CRIS_EXTRACT_DATE_START)
browser.find_by_id("requestDateProcessEnd").fill(CRIS_EXTRACT_DATE_END)
browser.find_by_text("Next").click()
wait(10)

print("Submit Request")
submit_button = browser.find_by_text("Submit Extract Request")
submit_button.click()

wait(10)

print("\nProcess done.")

end = time.time()
hours, rem = divmod(end - start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds))
