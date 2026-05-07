"""
Transfer CAD data CSV files from COACD network location to AWS S3 inbox
"""

import argparse
import os
import boto3
import logging

from utils.files import get_local_files_to_process

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

COACD_MOUNT_PATH = os.environ.get("COACD_MOUNT_PATH", "/mnt/vision_zero_cad")
BUCKET_NAME = os.environ["BUCKET_NAME"]
BUCKET_ENV = os.environ["BUCKET_ENV"]
S3_PREFIX = f"{BUCKET_ENV}/cad_incidents/inbox"


def main(args):
    s3 = boto3.client("s3")

    files_todo = get_local_files_to_process(dir_name=COACD_MOUNT_PATH)

    if not files_todo:
        raise Exception("No files found in COACD network directory")

    logger.info(f"Found {len(files_todo)} file(s) to process.")

    for file_path in files_todo:
        filename = os.path.basename(file_path)
        s3_key = f"{S3_PREFIX}/{filename}"

        if args.dry_run:
            logger.info(f"[DRY RUN] Would upload s3://{BUCKET_NAME}/{s3_key}")

        else:
            logger.info(f"Uploading s3://{BUCKET_NAME}/{s3_key}")
            s3.upload_file(file_path, BUCKET_NAME, s3_key)

        if args.remove:
            if args.dry_run:
                logger.info(f"[DRY RUN] Would remove {file_path}")
            else:
                logger.info(f"Removing {file_path}")
                os.remove(file_path)

    logger.info(f"Done. Processed {len(files_todo)} file(s).")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Transfer CAD data CSV files from COACD network location to AWS S3 inbox"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log what would be uploaded and deleted without actually doing it",
    )
    parser.add_argument(
        "--remove",
        action="store_true",
        help="'Delete the file(s) from the file system processing",
    )
    args = parser.parse_args()

    if args.dry_run:
        logger.info("DRY RUN enabled — no files will be uploaded or deleted.")

    main(args)
