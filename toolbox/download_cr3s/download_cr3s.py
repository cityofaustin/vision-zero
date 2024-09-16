import os
import re
import csv
import sys
import pprint
import logging
import argparse
from datetime import datetime

import boto3

# configure logging
logging.basicConfig()
log = logging.getLogger('CR3_download')
log.setLevel(logging.DEBUG)

argparse = argparse.ArgumentParser(description = 'Utility to restore last valid PDF in S3 for ATD VZ')
argparse.add_argument("-v", "--verbose",
    help = 'Be verbose about actions',
    required=False,
    action = 'store_true')
args = argparse.parse_args()

# This will be the pattern that we check column headers against to 
# decide if they are providing us a crash id. The regex is used to provide
# some flexibility so that if someone hand-crafts a CSV to provide the dev
# executing the program, this is at least likley to get the right data. 
crash_id_header_pattern = re.compile("^crash.{1}id$", re.I)

# configure our pretty printer
pp = pprint.PrettyPrinter(indent=2)

# get some environment variables to auth to S3
ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

bucket = 'atd-vision-zero-editor'

# Python should detect the encoding of the stream coming in on stdin,
# but it's failing on output from the VZE crash export function. 
# The VZE exports the CSV in utf-8-sig, so this instructs python to expect that. 
sys.stdin.reconfigure(encoding='utf-8-sig')

# we'll pile up our crashes in this list from the CSV file
# note this is an array of dicts, not just IDs
crashes = []

# consume the first line of the CSV to get the header values
reader = csv.reader(iter(sys.stdin.readline, ''))
headers = next(reader)[0:]

# iterate over the rest of the CSV to get at the crash data
for row in reader:
    crashes.append( {key: value for key, value in zip(headers, row[0:])} )

# take a peek at what we have
if args.verbose:
    log.info("Parsed input from CSV file")
    log.info(pp.pprint(crashes))

# define a set to hold our crash IDs. the nature of the set will 
# dedup this list
crash_ids = set()

# iterate over data rows and grab crash IDs based on header values
for crash in crashes:
    crash_id = [value for key, value in crash.items() if crash_id_header_pattern.match(key)]
    crash_ids.add(int(crash_id[0]))

# let's take a peek at our set of crash ids
if args.verbose:
    log.info("Unique set of crash IDs to download CR3s for:")
    log.info(pp.pprint(crash_ids))

s3_client = boto3.client('s3')

# create a path and make a location to receive the CR3 files
now = datetime.now()
path = 'downloaded_files/' + now.strftime("%Y%m%d-%-H%M%S") + '/'
if args.verbose:
    log.info("Making directory to store CR3 files: ./" + path)
os.makedirs(path)

# iterate over set of unique crash IDs and download the files from S3
for crash_id in crash_ids:
    s3_object = 'production/cris-cr3-files/' + str(crash_id) + '.pdf'
    if args.verbose:
        log.info("Downloading: " + s3_object)
    s3_client.download_file(bucket, s3_object, path + str(crash_id) + '.pdf')
