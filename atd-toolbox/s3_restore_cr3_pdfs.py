#!/usr/bin/python3

import os
import sys
import boto3
import argparse
from botocore.config import Config

ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

# setup and parse arguments
try:
    argparse = argparse.ArgumentParser(description = 'Utility to restore last valid PDF in S3 for ATD VZ')
    argparse.add_argument("-p", "--production", help = 'Specify the use of production environment', action = 'store_true')
    args = argparse.parse_args()
except:
    print("Failure to setup and parse arguments or -h specified")
    sys.exit(1)


# verify that environment variables were available and have populated variables used to auth to AWS
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
    prefix = 'production' if args.production else 'staging' + '/cris-cr3-files'
    s3.list_objects(Bucket= 'atd-vision-zero-editor', Prefix = prefix)['Contents']
except:
    print("Unable to complete call to S3; check AWS credentials")
    sys.exit(1)
