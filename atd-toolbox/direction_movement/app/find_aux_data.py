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
    sql = """
        with persons as (
        select crash_id, unit_nbr, death_cnt as k, sus_serious_injry_cnt as a, nonincap_injry_cnt as b
        from atd_txdot_primaryperson
        UNION ALL
        select crash_id, unit_nbr, death_cnt as k, sus_serious_injry_cnt as a, nonincap_injry_cnt as b
        from atd_txdot_person)
    select crashes.crash_id, coalesce(sum(persons.k),0) as k, coalesce(sum(persons.a),0) as a, coalesce(sum(persons.b),0) as b
    from atd_txdot_crashes crashes
    left join atd_txdot_units units on (crashes.crash_id = units.crash_id)
    left join persons on (crashes.crash_id = persons.crash_id and units.unit_nbr = persons.unit_nbr)
    where crashes.crash_id >= 9999
    and crashes.crash_id = %s
    group by crashes.crash_id
    """
    cursor = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql, (crash,))
    injuries = cursor.fetchone()
    cursor.close()
    return injuries


def get_geometry(crash):
    sql = "select position from atd_txdot_crashes where crash_id = %s"
    cursor = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql, (crash,))
    geometry = cursor.fetchone()
    cursor.close()
    return geometry


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
        injuries = get_people(crash[0])
        geometry = get_geometry(crash[0])
        pp.pprint(geometry)
        print(injuries)


if __name__ == "__main__":
    main()
