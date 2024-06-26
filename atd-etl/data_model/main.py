#!/usr/bin/env python
# docker run -it --rm --env-file .env --net host -v $PWD:/app data-model-dev bash
"""
Todo:
- populate cr3 fields in hasura
- s3 operations for pdfs
- interact with db import logging table
- use a flag to optionally use s3?
- logging
"""
import os

import boto3

from utils.cli import get_cli_args
from utils.process_csvs import process_csvs
from utils.process_pdfs import process_pdfs
from utils.utils import (
    get_unzipped_extracts_local,
    get_extract_zips_todo_local,
    get_extract_zips_to_download_s3,
    download_extract_from_s3,
    unzip_extract,
    move_zip_to_next_stage,
)
from utils.settings import LOCAL_EXTRACTS_DIR


def download_and_unzip_extract_if_needed(s3_client, s3, unzipped_only, extract):
    if s3 and extract.get("s3_file_key"):
        download_extract_from_s3(
            s3_client,
            extract["s3_file_key"],
            extract["file_size"],
            extract["local_zip_file_path"],
        )
    extract_dir = os.path.join(LOCAL_EXTRACTS_DIR, extract["extract_name"])
    # unzip the zip into <local-dir>/<extract-name
    if not unzipped_only:
        # it's possible to unzip only specific files, e.g. csvs, but i don't think there's a good reason to
        # use this functionality
        # unzip_extract(extract["local_zip_file_path"], extract_dir, file_filter=f"!*.csv")
        unzip_extract(extract["local_zip_file_path"], extract_dir)
    return extract_dir


def main(cli_args):
    current_stage = "new"
    s3_client = None
    s3_resource = None

    if cli_args.s3:
        s3_client = boto3.client("s3")
        s3_resource = boto3.resource("s3")

    if cli_args.unzipped_only:
        extracts_todo = get_unzipped_extracts_local(LOCAL_EXTRACTS_DIR)
    elif cli_args.s3:
        extracts_todo = get_extract_zips_to_download_s3(
            s3_client, current_stage, LOCAL_EXTRACTS_DIR
        )
    else:
        extracts_todo = get_extract_zips_todo_local(LOCAL_EXTRACTS_DIR)

    print(f"{len(extracts_todo)} extract(s) to process")

    if not extracts_todo:
        return

    for extract in extracts_todo:
        """Each extract is unzipped into its own directory as ./<extracts-dir>/<extract-name>/"""
        extract_dir = download_and_unzip_extract_if_needed(
            s3_client, cli_args.s3, cli_args.unzipped_only, extract
        )
        if cli_args.csv or (not cli_args.pdf and not cli_args.csv):
            process_csvs(extract_dir)
        if cli_args.pdf or (not cli_args.pdf and not cli_args.csv):
            process_pdfs(extract_dir)
        # if not local_only:
        #     move_zip_to_next_stage(
        #         s3_client, s3_resource, extract["file_key"], current_stage
        #     )


if __name__ == "__main__":
    cli_args = get_cli_args()
    main(cli_args)
