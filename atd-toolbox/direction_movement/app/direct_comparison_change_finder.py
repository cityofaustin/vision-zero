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

date_prior_to_cris_reprocessing = "2022-01-08"


def get_current_units():
    sql = """
    select units.crash_id, crashes.crash_date, units.unit_id, units.movement_id, units.travel_direction, units.veh_trvl_dir_id 
    from atd_txdot_units units
    left join atd_txdot_crashes crashes on (units.crash_id = crashes.crash_id)
    where 1 = 1
    and crashes.crash_date <= %s
    order by crashes.crash_id desc;
    """
    cursor = now.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql, (date_prior_to_cris_reprocessing,))
    current_units = cursor.fetchall()
    return current_units


def get_diff_from_past(current_unit):
    sql = """
    select units.crash_id, crashes.crash_date, units.unit_id, units.movement_id, units.travel_direction, units.veh_trvl_dir_id 
    from atd_txdot_units units
    left join atd_txdot_crashes crashes on (units.crash_id = crashes.crash_id)
    where 1 = 1
    and crashes.crash_date <= %s
    and units.unit_id = %s 
    and crashes.crash_id = %s 
    order by crash_id desc;
    """
    cursor = past.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(
        sql,
        (
            date_prior_to_cris_reprocessing,
            current_unit["unit_id"],
            current_unit["crash_id"],
        ),
    )
    past_unit = cursor.fetchone()

    # we didn't find a crash in the past, this one is new.
    if not past_unit:
        return None

    print(str(past_unit["crash_id"]) + ": " + str(past_unit["crash_date"]))

    fields_to_check = {"movement_id", "travel_direction", "veh_trvl_dir_id"}
    for field in fields_to_check:
        print(field)
    pp.pprint(past_unit)


def main():
    units = get_current_units()
    for unit in units:
        # pp.pprint(unit)
        # print("")
        # print(unit["crash_id"])
        diff = get_diff_from_past(unit)
        # pp.pprint(diff)


if __name__ == "__main__":
    main()
