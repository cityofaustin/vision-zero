#!/usr/bin/python3

import pprint
from re import I
import psycopg2
from psycopg2 import (
    extras,
)

# setup global objects
pp = pprint.PrettyPrinter(indent=2)

# setup both DB connections
past = psycopg2.connect(host="localhost", database="past_vz", user="moped", password="")

now = psycopg2.connect(
    host="localhost", database="current_vz", user="moped", password=""
)


def main():
    sql = """
    select crash_id, unit_id, 
    from atd_txdot_units
    """


if __name__ == "__main__":
    main()
