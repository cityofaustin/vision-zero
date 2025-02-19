import argparse

from utils.commands import COMMANDS


def get_cli_args():
    parser = argparse.ArgumentParser(
        description="Run SQL through the Hasura API",
        usage="main.py -c refresh_location_crashes",
    )
    parser.add_argument(
        "--command","-c",
        choices=[c["name"] for c in COMMANDS],
        help="The command to be executed",
        required=True,
    )
    return parser.parse_args()
