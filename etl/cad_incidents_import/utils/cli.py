import argparse

def get_cli_args():
    parser = argparse.ArgumentParser(
        description="Import CAD incident records into the Vision Zero Database",
        usage="import_incidents.py ems",
    )
    parser.add_argument(
        "--skip-archive","-s",
        help="Skip the archival step of moving each processed file to the S3 bucket's /archive directory",
        action="store_true"
    )
    return parser.parse_args()
