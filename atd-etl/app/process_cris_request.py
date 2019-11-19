#!/usr/bin/env python
"""
CRIS - Request Script
Author: Austin Transportation Department, Data and Technology Office

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


def wait(int):
    print("Should wait: %s" % str(int))
    time.sleep(int)

# Start timer
start = time.time()

# Report Dates
date_now = datetime.datetime.now()
date_month_ago = date_now + dateutil.relativedelta.relativedelta(days=-3)
CRIS_EXTRACT_DATE_START=date_month_ago.strftime('%m/%d/%Y')
CRIS_EXTRACT_DATE_END=date_now.strftime('%m/%d/%Y')

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

# Visit Chris
print("Logging in to '%s'" % ATD_ETL_CONFIG["ATD_CRIS_WEBSITE"])
browser.visit(ATD_ETL_CONFIG["ATD_CRIS_WEBSITE"])

# Select the agency, then click Continue
print("Filling out agency.")
browser.find_by_id('idpSelectInput').fill('* Texas Department of Transportation')
browser.find_by_id('idpSelectSelectButton').click()

# We log in
print("Filling out credentials.")
browser.find_by_id('username').fill(ATD_ETL_CONFIG["ATD_CRIS_REQUEST_USERNAME"])
browser.find_by_id('password').fill(ATD_ETL_CONFIG["ATD_CRIS_REQUEST_PASSWORD"])
browser.find_by_name('_eventId_proceed').click()


# Let's begin our data extract request
print("Selecting data extract request")
browser.find_by_text("Create Data Extract Request").click()
wait(10)

browser.find_by_text("Continue").click()
wait(10)

print("Selecting Counties to be Included in the Extract")
browser.find_by_css('input[ng-value="shareConstants.LOCATION_TYPE_IDS.COUNTY"]').click()
browser.execute_script("$(\"div[data-value='105']\").click()") # Travis
browser.execute_script("$(\"div[data-value='227']\").click()") # Williamson
browser.execute_script("$(\"div[data-value='246']\").click()") # Hays
wait(3)

print("\nProcess done.")

end = time.time()
hours, rem = divmod(end-start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours),int(minutes),seconds))
