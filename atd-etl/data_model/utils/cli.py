import argparse

def get_cli_args():
    parser = argparse.ArgumentParser(
        description="Process CRIS extact zip files, including CSV data and CR3 crash reports",
        usage="main.py --csv --verbose"
    )
    parser.add_argument(
        f"--csv",
        action="store_true",
        help="Only process CSV files",
    )
    parser.add_argument(
        f"--pdf",
        action="store_true",
        help="Only process CR3 pdfs",
    )
    parser.add_argument(
        f"--s3",
        action="store_true",
        help="Process zip extracts in S3 bucket and also upload processed CR3 PDFs to S3",
    )
    parser.add_argument(
        f"--unzipped-only",
        "-u",
        action="store_true",
        help="Only process files that are already unzipped in the local directory",
    )
    parser.add_argument(
        f"--verbose",
        "-v",
        action="store_true",
        help="Sets logging level to DEBUG mode",
    )
    return parser.parse_args()
