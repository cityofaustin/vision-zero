import argparse

def get_cli_args():
    parser = argparse.ArgumentParser(
        description="Import EMS or AFD incident records into the Vision Zero Database",
        usage="import_incidents.py ems",
    )
    parser.add_argument(
        "source",
        choices=["ems", "afd"],
        help="The incident source: choose 'afd' or 'ems'",
    )
    parser.add_argument(
        "--skip-archive","-s",
        help="Skip the archival step of moving each processed file to the S3 bucket's /archive directory",
        action="store_true"
    )
    parser.add_argument(
        "--local-files",
        action="store_true",
        help="Source local CSV/XLSX files from ./data directory instead of pulling from S3/email",
    )
    return parser.parse_args()
