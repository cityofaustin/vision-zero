#!/usr/bin/env python
# docker run -it --rm --env-file .env --net host -v $PWD:/app data-model-dev bash
"""
Todo:
- populate cr3 fields in hasura
- s3 operations for pdfs
- interact with db import logging table
"""
import os

import boto3

from utils.cli import get_cli_args
from utils.logging import init_logger
from utils.process_csvs import process_csvs
from utils.process_pdfs import process_pdfs
from utils.files import (
    get_unzipped_extracts_local,
    get_extract_zips_todo_local,
    get_extract_zips_to_download_s3,
    download_and_unzip_extract_if_needed,
    archive_extract_zip,
)


def main(cli_args):

    if cli_args.skip_unzip:
        extracts_todo = get_unzipped_extracts_local()
    elif cli_args.s3_download:
        extracts_todo = get_extract_zips_to_download_s3()
    else:
        extracts_todo = get_extract_zips_todo_local()

    logger.info(f"{len(extracts_todo)} extract(s) to process")

    if not extracts_todo:
        return

    for extract in extracts_todo:
        """Each extract is unzipped into its own directory as ./<extracts-dir>/<extract-name>/"""
        extract_dir = download_and_unzip_extract_if_needed(
            cli_args.s3_download, cli_args.skip_unzip, extract
        )
        if cli_args.csv or (not cli_args.pdf and not cli_args.csv):
            process_csvs(extract_dir)
        if cli_args.pdf or (not cli_args.pdf and not cli_args.csv):
            process_pdfs(extract_dir, cli_args.s3_upload)
        if cli_args.s3_download and cli_args.s3_archive and not cli_args.skip_unzip:
            archive_extract_zip(extract["s3_file_key"])


if __name__ == "__main__":
    cli_args = get_cli_args()
    logger = init_logger(debug=cli_args.verbose)
    if cli_args.s3_archive and not cli_args.s3_download:
        raise ValueError("--s3-archive has no effect without --s3-download")
    if cli_args.skip_unzip and cli_args.s3_download:
        raise ValueError("Cannot use --s3-download in combination with --skip-unzip")
    main(cli_args)
