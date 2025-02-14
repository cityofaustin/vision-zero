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
    return parser.parse_args()
