# docker run -it --rm --env-file .env  -v $PWD:/app data-model-dev bash
import os
from tempfile import TemporaryDirectory

import boto3

from utils.utils import (
    get_extracts_todo,
    download_and_unzip_extract,
    move_zip_to_next_stage,
)


def main():
    current_stage = "new"
    s3_client = boto3.client("s3")
    s3_resource = boto3.resource("s3")
    extracts = get_extracts_todo(s3_client, current_stage)

    print(f"{len(extracts)} extracts to process")

    if not extracts:
        return

    for extract in extracts:
        with TemporaryDirectory() as temp_dir_name:
            download_and_unzip_extract(s3_client, temp_dir_name, **extract)
            csvs = [f for f in os.listdir(temp_dir_name) if f.endswith(".csv")]
            print("do cris import....")
            move_zip_to_next_stage(
                s3_client, s3_resource, extract["file_key"], current_stage
            )


if __name__ == "__main__":
    main()
