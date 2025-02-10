#!/usr/bin/env python
import json
import logging
import os
import sys

import requests

from utils.cli import get_cli_args
from utils.commands import COMMANDS

ENDPOINT = os.getenv("HASURA_GRAPHQL_ENDPOINT")
ADMIN_SECRET = os.getenv("HASURA_GRAPHQL_ADMIN_SECRET")

logging.basicConfig(stream=sys.stdout, level=logging.INFO)


def run_sql(sql):
    """Run arbitrary SQL through the the Hasura schema API.

    The ENDPOINT must provide the full path to the schema API, which
    is currently `/v2/query`.

    Args:
        sql (Str): The sql to be executed, including a final semicolon.
    """
    if not ENDPOINT:
        raise OSError("HASURA_GRAPHQL_ENDPOINT env var is required")

    payload = {
        "type": "run_sql",
        "args": {"source": "default", "sql": sql},
    }

    logging.info(f"Executing: {sql}")
    res = requests.post(
        ENDPOINT, json=payload, headers={"x-hasura-admin-secret": ADMIN_SECRET}
    )

    try:
        logging.info(res.json())
    except json.JSONDecodeError:
        logging.info(res.text)

    res.raise_for_status()



if __name__ == "__main__":
    cli_args = get_cli_args()
    command = next(c for c in COMMANDS if c["name"] == cli_args.command)
    run_sql(command["sql"])
