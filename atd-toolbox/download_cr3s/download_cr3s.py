import re
import csv
import sys
import pprint

import boto3

crash_id_header_pattern = re.compile("^crash.{1}id$", re.I)

# configure our pretty printer
pp = pprint.PrettyPrinter(indent=2)

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
pp.pprint(crashes)

for crash in crashes:
    value = [value for key, value in crash.items() if crash_id_header_pattern.match(key)]
    print(value)


