"""
Move all zip files in the bucket from ./archive to ./new
"""

import os
from tempfile import TemporaryDirectory

import boto3

from utils.utils import (
    get_extracts_todo_from_s3,
)

BUCKET_NAME = os.environ["BUCKET_NAME"]


def main():
    s3_client = boto3.client("s3")
    s3_resource = boto3.resource("s3")

    extracts = get_extracts_todo_from_s3(s3_client, "archive")

    print(f"{len(extracts)} extracts to restore")

    if not extracts:
        return

    for extract in extracts:
        file_key = extract["file_key"]
        new_key = file_key.replace("archive", "new")
        print(f"Copying zip to {BUCKET_NAME}/{new_key}")
        s3_resource.meta.client.copy(
            {"Bucket": BUCKET_NAME, "Key": file_key}, BUCKET_NAME, new_key
        )


if __name__ == "__main__":
    main()
