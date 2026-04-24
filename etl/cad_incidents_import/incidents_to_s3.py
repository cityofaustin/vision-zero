"""
Transfer CAD data CSV files from COACD network location to AWS S3 inbox
"""

import argparse
import os
import re
import boto3
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

COACD_MOUNT_PATH = os.environ.get("COACD_MOUNT_PATH", "/mnt/tpw_cadtraffic")
BUCKET_NAME = os.environ["BUCKET_NAME"]
BUCKET_ENV = os.environ["BUCKET_ENV"]
S3_PREFIX = f"{BUCKET_ENV}/cad_incidents/inbox"


def is_file_to_process(filename):
    """
    Check if the file name matches our naming convention
    - TPWCADTrafficSafetyWithGroupIDDaily_20260410.CSV
    - TPWCADTrafficSafetyDaily_20260410.CSV
    """
    return (
        filename.lower().endswith(".csv")
        and (
            "TPWCADTrafficSafetyWithGroupIDDaily" in filename
            or "TPWCADTrafficSafetyDaily" in filename
        )
        and len(filename.split("_")) == 2
    )


def extract_date(filename: str) -> str:
    """Extract the date string from a filename for sorting.

    We expect files named in either of these two ways
        - TPWCADTrafficSafetyWithGroupIDDaily_20260410.CSV
        - TPWCADTrafficSafetyDaily_20260410.CSV

    Non-conforming files are ignored
    """
    full_name, ext = filename.split(".")
    name, dt = full_name.split("_")
    return dt


def main():
    parser = argparse.ArgumentParser(
        description="Transfer CAD data CSV files from COACD network location to AWS S3 inbox"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log what would be uploaded and deleted without actually doing it",
    )
    args = parser.parse_args()

    if args.dry_run:
        logger.info("DRY RUN enabled — no files will be uploaded or deleted.")

    s3 = boto3.client("s3")

    files = [f for f in os.listdir(COACD_MOUNT_PATH) if is_file_to_process(f)]

    if not files:
        raise Exception("No files found in COACD network directory")

    files.sort(key=extract_date)
    logger.info(f"Found {len(files)} file(s) to process.")

    for filename in files:
        local_path = os.path.join(COACD_MOUNT_PATH, filename)
        s3_key = f"{S3_PREFIX}/{filename}"

        if args.dry_run:
            logger.info(
                f"[DRY RUN] Would upload {filename} → s3://{BUCKET_NAME}/{s3_key}"
            )
            logger.info(f"[DRY RUN] Would remove {local_path}")
        else:
            logger.info(f"Uploading {filename} → s3://{BUCKET_NAME}/{s3_key}")
            s3.upload_file(local_path, BUCKET_NAME, s3_key)

            logger.info(f"Removing {local_path}")
            os.remove(local_path)

    logger.info(f"Done. Processed {len(files)} file(s).")


if __name__ == "__main__":
    main()
