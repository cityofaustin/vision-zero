#!/usr/bin/python3

import os
import sys
import boto3
from botocore.config import Config
from botocore.client import ClientError

#FIXME
# add command arg to specify production; default to staging

ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

# verify that environment variables were available and have populated variables used to auth to AWS
try:
    assert(ACCESS_KEY is not None and SECRET_KEY is not None)
except:
    print("Please set environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY")
    sys.exit(1)


try:
    aws_config = Config(
            region_name = 'us-east-1',
            )

    s3 = boto3.client(
            's3', 
            aws_access_key_id = ACCESS_KEY, 
            aws_secret_access_key = SECRET_KEY, 
            config = aws_config)
    s3.list_objects(Bucket= 'atd-vision-zero-editor', Prefix = 'staging/cris-cr3-files')['Contents']
except:
    print("Unable to list directory; check AWS credentials")
    sys.exit(1)
