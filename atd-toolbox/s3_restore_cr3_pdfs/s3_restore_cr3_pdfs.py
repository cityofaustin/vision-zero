import re
import os
import sys
import json
import logging
import argparse
import datetime
from operator import attrgetter

import boto3
import magic
import requests
from botocore.config import Config


logging.basicConfig()
log = logging.getLogger('restore')
log.setLevel(logging.DEBUG)


s3_resource = boto3.resource('s3')

ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
HASURA_ADMIN_KEY = os.getenv('HASURA_ADMIN_KEY')
HASURA_ENDPOINT = os.getenv('HASURA_ENDPOINT')

HEADERS = {
          "X-Hasura-Admin-Secret": HASURA_ADMIN_KEY,
          "Content-Type": "application/json",
          }

bucket = 'atd-vision-zero-editor'


# https://github.com/cityofaustin/atd-airflow/blob/master/dags/python_scripts/atd_vzd_cr3_scan_pdf_records.py#L24
def is_valid_metadata(metadata: dict) -> bool:
    if metadata.get("last_update", None) is not None \
       and metadata.get("file_size", None) is not None \
       and metadata.get("mime_type", None) is not None \
       and metadata.get("encoding", None) is not None:
        return True
    return False


# setup and parse arguments
try:
    argparse = argparse.ArgumentParser(description = 'Utility to restore last valid PDF in S3 for ATD VZ')

    argparse.add_argument("-p", "--production",
            help = 'Specify the use of production environment',
            action = 'store_true')

    argparse.add_argument("-c", "--crashes",
            help = 'Specify JSON file containing crashes to operate on. Format: { "crashes": [ crash_id_0, crash_id_1, .. ] }',
            required=True,
            metavar = 'crashes.json')

    argparse.add_argument("--i-understand",
            help = 'Do not ask the user to acknoledge that this program changes the state of S3 objects and the database.',
            action = 'store_true')

    args = argparse.parse_args()
except Exception as e:
    # a stderr log is not needed, argparse croaks verbosly
    sys.exit(1)


# This program will change the state of S3 objects.  Make sure the user is OK with what is about to happen.
try:
    if not args.i_understand:
        # these do not use the logging functionality to avoid the timestamp on each and increase readability
        print('')
        print("This program changes S3 Objects and the Vision Zero database.")
        print('')
        print("This program will restore previous PDF CR3 versions for crashes")
        print("specified in the JSON object you provide.")
        print('')
        print("If there is a 'application/pdf' stored as a previous version of a specified")
        print("crash's CR3, this program will restore that file to the current version.")
        print('')
        print("This program will also update the databases cr3_file_metadata field")
        print("for crash records based on the S3 file restored.")
        print('')
        print("Please type 'I understand' to continue.")
        print('')
        ack = input()
        assert(re.match("^i understand$", ack, re.I))
except Exception as e:
    log.error("User acknoledgement failed.")
    log.debug(str(e))
    sys.exit(1)


# verify that environment AWS variables were available and have populated values to be used to auth to AWS
try:
    assert(ACCESS_KEY is not None and SECRET_KEY is not None)
except Exception as e:
    log.error("Please set environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY")
    sys.exit(1)


# verify that environment Hasura variables were available and have populated values
try:
    assert(HASURA_ADMIN_KEY is not None and HASURA_ENDPOINT is not None)
except Exception as e:
    log.error("Please set environment variables HASURA_ADMIN_KEY and HASURA_ENDPOINT")
    sys.exit(1)


# sanity check the provided hasura endpoint and the assertion from the user about staging/production
if (args.production):
    try:
        assert(not re.search("staging", HASURA_ENDPOINT, re.I))
    except Exception as e:
        log.error("Production flag used but staging appears in the Hasura endpoint URL")
        sys.exit(1)
else:
    try:
        assert(re.search("staging", HASURA_ENDPOINT, re.I))
    except Exception as e:
        log.error("Production flag is not used and staging doesn't appear in the Hasura endpoint URL")
        sys.exit(1)


# connect to AWS/S3 and validate connection
try:
    aws_config = Config(
            region_name = 'us-east-1',
            )

    s3 = boto3.client(
            's3', 
            aws_access_key_id = ACCESS_KEY, 
            aws_secret_access_key = SECRET_KEY, 
            config = aws_config
            )
    prefix = ('production' if args.production else 'staging') + '/cris-cr3-files/'
    s3.list_objects(Bucket = bucket, Prefix = prefix)
except Exception as e:
    log.error("Unable to complete call to S3; check AWS credentials")
    log.debug(str(e))
    sys.exit(1)


# check to see if file is available on disk
try:
    assert(os.path.isfile(args.crashes))
except Exception as e:
    log.error("Crashes file is not available on disk")
    sys.exit(1)


# parse JSON file containing crashes
with open(args.crashes) as input_file:
    try:
        crashes = json.load(input_file)['crashes']
    except Exception as e:
        log.error("Crashes file contains invalid JSON")
        log.debug(str(e))
        sys.exit(1)


# iterate over crashes found in JSON object
for crash in crashes:
    log.info("Crash: " + str(crash))

    try:
        # graphql query to get current cr3_file_metadata
        get_metadata = """
        query get_cr3_metadata($crashId: Int) {
            atd_txdot_crashes(where: {crash_id: {_eq: $crashId}}) {
                cr3_file_metadata
                }
            }
        """

        # get the metadata as a dict or None if null in DB
        cr3_metadata = requests.post(HASURA_ENDPOINT, headers = HEADERS, data = json.dumps(
            {
            "query": get_metadata,
            "variables": {
                "crashId": crash
                }
            })).json()['data']['atd_txdot_crashes'][0]['cr3_file_metadata']

    except Exception as e:
        log.error("Request to get existing CR3 metadata failed.")
        log.debug(str(e))
        sys.exit(1)


    if cr3_metadata is None:
        log.info("No metadata in database for crash; creating empty dict to populate")
        cr3_metadata = {}


    key = prefix +  str(crash) + '.pdf'

    # get versions of object sorted most recent to oldest
    versions = sorted(s3_resource.Bucket(bucket).object_versions.filter(Prefix = key), 
                        key=attrgetter('last_modified'), reverse=True)

    # keep track of if we found one for diagnostic message logging
    previous_version_found = False
    for version in versions:
        obj = version.get()

        # read canidate previous version into a variable
        # this avoids needing to put the file to disk for the use of the `file` command
        previous_version = obj['Body'].read()

        # not really magic; the underlying library of the `file` command on unix is called libmagic
        # use libmagic to figure out what kind of file the file is
        mime_type = magic.Magic(flags = magic.MAGIC_MIME_TYPE).id_buffer(previous_version)
        encoding = magic.Magic(flags = magic.MAGIC_MIME_ENCODING).id_buffer(previous_version)

        if mime_type != 'application/pdf':
            log.info("Skipping version " + obj.get('VersionId') + " because it is a " + mime_type)
            continue
        else:
            log.info("Version " + obj.get('VersionId') + " is acceptable for restoration because it is a " + mime_type)

        # update the cr3 file metadata dict
        cr3_metadata['mime_type'] = mime_type
        cr3_metadata['encoding'] = encoding
        cr3_metadata['file_size'] = obj.get('ContentLength')
        # it's debatable if we should inherit the last modified time of the version being restored
        cr3_metadata['last_update'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # date of restore and indication that this was populated by this restoration script
        cr3_metadata['restored'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


        # check for complete metadata
        if not is_valid_metadata(cr3_metadata):
            log.warning("Invalid metadata after updates")
            continue

        # if we get here, we have found one, so note it and log it
        previous_version_found = True

        log.info("Restoring " +  obj.get('VersionId') + " to " + key)

        # restore the file, in situ on s3, from the previous version
        s3_resource.Object(bucket, key).copy_from(CopySource = { 'Bucket': bucket, 'Key': key, 'VersionId': obj.get('VersionId') } )

        # update the files metadata in the database
        update_cr3_metadata = """
        mutation update_cr3_metadata ($crashId: Int, $cr3_file_metadata: jsonb) {
          update_atd_txdot_crashes(
            where: { crash_id: {_eq: $crashId} },
            _set: {
              cr3_file_metadata: $cr3_file_metadata
            }
          ) {
            affected_rows
          }
        }
        """

        affected_rows = requests.post(HASURA_ENDPOINT, headers = HEADERS, data = json.dumps(
            {
            "query": update_cr3_metadata,
            "variables": {
                "crashId": crash,
                "cr3_file_metadata": cr3_metadata
                }
            })).json()['data']['update_atd_txdot_crashes']['affected_rows']

        log.info("Affected database rows: " + str(affected_rows))

        # once we've restored, we don't want to restore anymore, as we only want the most recent valid file
        break

    # this bool remains false if we never did a restore, so alert the user
    if not previous_version_found:
        log.warning("No previous PDF versions found for crash " + str(crash))

    # drop a new line for more human readable stdout
    print("")
