#!/usr/bin/env python
from datetime import datetime, timezone

from utils.cli import get_cli_args
from utils.graphql import create_log_entry, update_log_entry
from utils.logging import init_logger
from utils.process_csvs import process_csvs
from utils.process_pdfs import process_pdfs
from utils.files import (
    get_extract_dir,
    get_unzipped_extracts_local,
    get_extract_zips_todo_local,
    get_extract_zips_to_download_s3,
    download_extract_from_s3,
    unzip_extract,
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

    if cli_args.s3_download and not extracts_todo:
        # always short circuit if we find nothing in S3
        raise Exception("No extracts found in S3 bucket")

    for extract in extracts_todo:
        records_processed = {
            "crashes": 0,
            "units": 0,
            "persons": 0,
            "charges": 0,
            "pdfs": 0,
        }
        log_entry_id = create_log_entry(**extract)
        extract_dir = get_extract_dir(extract["extract_name"])
        if cli_args.s3_download:
            download_extract_from_s3(
                extract["s3_file_key"],
                extract["file_size"],
                extract["local_zip_file_path"],
            )
        if not cli_args.skip_unzip:
            unzip_extract(extract["local_zip_file_path"], extract_dir)
        if cli_args.csv:
            csv_records_processed_dict = process_csvs(extract_dir)
            records_processed.update(csv_records_processed_dict)

            # update the import log to capture # of csvs processed
            update_log_entry(
                log_entry_id=log_entry_id,
                payload={
                    "records_processed": records_processed,
                },
            )

        no_crashes_found = (
            True if cli_args.csv and records_processed["crashes"] == 0 else False
        )

        if cli_args.pdf and not no_crashes_found:
            pdfs_processed_count = process_pdfs(
                extract_dir, cli_args.s3_upload, cli_args.workers
            )
            records_processed["pdfs"] = pdfs_processed_count
        elif cli_args.pdf and no_crashes_found:
            # we skip PDF processing when there are no CSV crashes, because in those cases
            # the extract may not contain a `crashReports` directory — and that will
            # cause an unwanted failure
            logger.info("Skipping PDF processing because no CSV crashes were processed")

        # if processing CSVs and PDFs, check the the number of crashes matches the number of PDFs
        # this used to raise and exception until the CRIS v28 release on August 26, 2024 which
        # resulted in some PDFs being excluded from extracts
        if cli_args.pdf and cli_args.csv:
            if records_processed["crashes"] != records_processed["pdfs"]:
                logger.warning(
                    f"Warning: there was a mismatch between the # of CSV crashes processed ({records_processed['crashes']}) vs the CR3 PDFs processed ({records_processed['pdfs']})."
                )

        if cli_args.s3_download and cli_args.s3_archive and not cli_args.skip_unzip:
            archive_extract_zip(extract["s3_file_key"])

        # update the import log entry
        update_log_entry(
            log_entry_id=log_entry_id,
            payload={
                "records_processed": records_processed,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            },
        )


if __name__ == "__main__":
    cli_args = get_cli_args()
    logger = init_logger(debug=cli_args.verbose)
    if not cli_args.csv and not cli_args.pdf:
        raise ValueError("Must specify at least one of --csv or --pdf")
    if cli_args.s3_archive and not cli_args.s3_download:
        raise ValueError("--s3-archive has no effect without --s3-download")
    if cli_args.skip_unzip and cli_args.s3_download:
        raise ValueError("Cannot use --s3-download in combination with --skip-unzip")
    main(cli_args)
