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
    order by crashes.crash_date desc;
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
    order by crash_date desc;
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
    if not past_unit:
        return None

    # we didn't find a crash in the past, this one is new.
    if not past_unit:
        return None

    fields_to_check = {"movement_id", "travel_direction"}  # , "veh_trvl_dir_id"}
    diff = dict()
    for field in fields_to_check:
        if current_unit[field] != past_unit[field]:
            # is data defined for the crash?
            if not current_unit["crash_id"] in diff:
                diff[current_unit["crash_id"]] = dict()
            # is there a unit defined in this crash?
            if not current_unit["unit_id"] in diff[current_unit["crash_id"]]:
                diff[current_unit["crash_id"]][current_unit["unit_id"]] = dict()
            diff[current_unit["crash_id"]][current_unit["unit_id"]][field] = {
                "old": past_unit[field],
                "current": current_unit[field],
            }
    if len(diff):
        # the data returned here is a per-crash, per-unit slice of the entire difference set
        return diff
    else:
        return None


def find_change_log_entry_for_change(crash, unit, field, value):
    print("Potential: ", str(crash), " ", str(unit), " ", str(field), " ", str(value))

    sql = """
    select *, (((extract(hour from update_timestamp) * 60) + extract(minute from update_timestamp))/30)::integer not in (16,17,18,19,20) as time_bin
    from atd_txdot_change_log
    where 1 = 1
    and record_type = 'units'
    and record_crash_id = %s
    and record_id = %s
    --and (((extract(hour from update_timestamp) * 60) + extract(minute from update_timestamp))/30)::integer not in (16,17,18,19,20)
    order by update_timestamp asc
    """

    event_one_found = False

    cursor = now.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql, (crash, unit))
    changes = cursor.fetchall()

    invalid_time_bins = {16, 17, 18, 19, 20}

    for change in changes:
        if event_one_found == False and change["record_json"][field] != value:
            event_one_found = True
            continue
        if (
            event_one_found == True
            and change["time_bin"] not in invalid_time_bins
            and change["record_json"][field] == value
        ):
            print(
                "Found: ", str(crash), " ", str(unit), " ", str(field), " ", str(value)
            )

    return None


def main():
    units = get_current_units()
    for unit in units:
        diff = get_diff_from_past(unit)
        if not diff:
            continue
        # pp.pprint(diff)
        crash = list(diff.keys())[0]
        unit = list(diff[crash].keys())[0]
        fields = list(diff[crash][unit].keys())
        for field in fields:
            current_value = diff[crash][unit][field]["current"]
            find_change_log_entry_for_change(crash, unit, field, current_value)


if __name__ == "__main__":
    main()
