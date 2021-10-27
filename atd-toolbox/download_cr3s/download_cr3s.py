import re
import csv
import sys
import pprint

import boto3


# This will be the pattern that we check column headers against to 
# decide if they are providing us a crash id. The regex is used to provide
# some flexibility so that if someone hand-crafts a CSV to provide the dev
# executing the program, this is at least likley to get the right data. 
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
#pp.pprint(crashes)

# define a set to hold our crash IDs. the nature of the set will 
# dedup this list
crash_ids = set()

for crash in crashes:
    crash_id = [value for key, value in crash.items() if crash_id_header_pattern.match(key)]
    crash_ids.add(int(crash_id[0]))

# let's take a peek at our set of crash ids
pp.pprint(crash_ids)

