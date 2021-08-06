#!/usr/bin/python3

import os
import sys

ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

# verify that environment variables were available and have populated variables used to auth to AWS
try:
    assert(ACCESS_KEY is not None and SECRET_KEY is not None)
except:
    print("Please set environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY")
    sys.exit(1)
