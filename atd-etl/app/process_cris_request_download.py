#!/usr/bin/env python
"""
CRIS - Request Download
Author: Austin Transportation Department, Data and Technology Services

Description: This script will process emails deposited on an S3 bucket on AWS.
Data extracts are routed and saved into a private S3 bucket where they will be
waiting to be 'processed'. The emails contain a download link, which requires
the user to log in to the CRIS website and proceed to the download.

The application requires the following libaries:
    https://splinter.readthedocs.io/en/latest/
    https://pypi.org/project/boto3/
    https://pypi.org/project/mail-parser/
"""
#
# First we import some basic libraries and helper functions
#
import time
import datetime
import dateutil.relativedelta

from process.helpers_request_download import *
from process.config import ATD_ETL_CONFIG

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
wait(10)
browser.find_by_id("username").fill(ATD_ETL_CONFIG["ATD_CRIS_REQUEST_USERNAME"])
browser.find_by_id("password").fill(ATD_ETL_CONFIG["ATD_CRIS_REQUEST_PASSWORD"])
browser.find_by_name("_eventId_proceed").click()

wait(5)

print("Gathering email file list from S3")
email_file_list = get_email_list()

for email in email_file_list:
    download_s3_file(email)


for email_file in email_file_list:
    # Parse the file
    cris_email = parse_email(email_file)
    cris_download_link, cris_download_token = extract_email_download_link(
        cris_email.body
    )
    print("Loaded Email File: '%s'" % email_file)
    print("Body: %s" % cris_email.body)
    print("Url Download: '%s'" % cris_download_link)
    print("Download Token: '%s'" % cris_download_token)

    if cris_download_link is None or cris_download_token is None:
        print("\n\nFailed to obtain file url from email.\n\n")
        continue

    request_download_url = request_zip_file_url(
        cris_download_token, cookies=browser.cookies.all()
    )

    if "error" in request_download_url:
        print(request_download_url)
        continue
    else:
        print("Final Download URL: '%s'" % request_download_url)
        cris_download_zip_file(request_download_url, cookies=browser.cookies.all())


#
# Extract ZIP Files
#

zip_file_list = get_zip_file_list()

print("Unzipping files: ")
print(zip_file_list)

for zip_file in zip_file_list:
    print("Unzipping file: '%s'" % zip_file)
    extract_zip(zip_file)

#
# We need to move folders for emails, from pending folder to finished.
#
print("Moving E-Mail Files from S3 pending to finished folders:")
for email_file in email_file_list:
    print("Moving file: '%s'" % email_file)
    move_email_to_finished(email_file)

print("\nProcess done.")

end = time.time()
hours, rem = divmod(end - start, 3600)
minutes, seconds = divmod(rem, 60)
print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds))
