#!/usr/bin/python3

import os
import sys
import json
import boto3
import argparse
from botocore.config import Config

s3_resource = boto3.resource('s3')


ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

bucket = 'atd-vision-zero-editor'

#FIXME
# print errors to stderr where they belong

# setup and parse arguments
try:
    argparse = argparse.ArgumentParser(description = 'Utility to restore last valid PDF in S3 for ATD VZ')
    argparse.add_argument("-p", "--production", help = 'Specify the use of production environment', action = 'store_true')
    argparse.add_argument("-c", "--crashes", help = 'Specify JSON file containing crashes to operate on. Format: { "crashes": [ crash_id_0, crash_id_1, .. ] }', required=True, metavar = 'crashes.json')
    args = argparse.parse_args()
except:
    sys.exit(1)

# verify that environment variables were available and have populated values to be used to auth to AWS
try:
    assert(ACCESS_KEY is not None and SECRET_KEY is not None)
except:
    print("Please set environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY")
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
            config = aws_config)
    prefix = ('production' if args.production else 'staging') + '/cris-cr3-files/'
    s3.list_objects(Bucket = bucket, Prefix = prefix)
except:
    print("Unable to complete call to S3; check AWS credentials")
    sys.exit(1)


# check to see if file is available on disk
try:
    assert(os.path.isfile(args.crashes))
except:
    print("Crashes file is not available on disk")
    sys.exit(1)


#parse JSON file containing crashes
with open(args.crashes) as input_file:
    try:
        crashes = json.load(input_file)['crashes']
    except:
        print("Crashes file is invalid JSON")
        sys.exit(1)

# iterate over crashes found in JSON object
for crash in crashes:
    print("Crash: " + str(crash))

    key = prefix +  str(crash) + '.pdf'
    versions = s3_resource.Bucket(bucket).object_versions.filter(Prefix = key)
    previous_version_found = False
    for version in versions:
        obj = version.get()
        if obj.get('ContentLength') > 10 * 2**10: # 10K
            previous_version_found = True
            print(obj.get('VersionId'), obj.get('ContentLength'), obj.get('LastModified'))
    if not previous_version_found:
        print("No previous versions found for crash " + str(crash))
