#!/usr/bin/python3

import pprint

import psycopg2
from psycopg2 import (
    extras,
)

# setup global objects
pp = pprint.PrettyPrinter(indent=2)

db = psycopg2.connect(
    host="localhost", database="current_vz", user="moped", password=""
)


def get_people(crash):
    print(crash)


def main():
    sql = """
    select crash_id
    from movement_direction_corrections
    """
    cursor = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql)
    crashes = cursor.fetchall()
    cursor.close()

    for crash in crashes:
        people = get_people(crash)


if __name__ == "__main__":
    main()
