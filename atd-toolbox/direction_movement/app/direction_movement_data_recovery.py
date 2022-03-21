#!/usr/bin/python3

import pprint
import psycopg2
from psycopg2 import (
    extras,
)


def get_change_events_from_past():
    sql = """
    select *,
           (((extract(hour from update_timestamp) * 60) + extract(minute from update_timestamp))/30)::integer as time_bin
    from atd_txdot_change_log
    where 1 = 1
    and record_type = 'units'
    and (((extract(hour from update_timestamp) * 60) + extract(minute from update_timestamp))/30)::integer not in (16,17,18,19,20)
    order by update_timestamp desc
    """
    cursor = past.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql)
    changes = cursor.fetchall()
    return changes


def check_current_state(id, previous_record):
    changes = {}
    sql = f"""
    select * from atd_txdot_units where unit_id = {id}
    """
    cursor = now.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql)
    current_value = cursor.fetchone()

    if not current_value:
        # print(f"⚠️ Couldn't find unit record in current database for ID {id}?")
        return dict()

    for key in previous_record.keys():
        if previous_record[key] != current_value[key]:
            if key in fields_to_skip:
                continue
            if (previous_record[key] is None and current_value[key] == "") or (
                previous_record[key] == "" and current_value[key] is None
            ):
                continue
            changes[key] = {"old": previous_record[key], "new": current_value[key]}
    return changes


pp = pprint.PrettyPrinter(indent=2)

# setup both DB connections
past = psycopg2.connect(host="localhost", database="past_vz", user="moped", password="")

now = psycopg2.connect(
    host="localhost", database="current_vz", user="moped", password=""
)

# the fields we're not going to worry about
fields_to_skip = {"last_update", "updated_by"}
# the fields we're focused on
fields_to_require = {"movement_id", "travel_direction", "veh_trvl_dir_id"}

# the units we've already seen
updated_unit_fields = dict()
update_sql_statements = set()

change_records = get_change_events_from_past()
for change_record in change_records:
    diff = check_current_state(change_record["record_id"], change_record["record_json"])
    diff_keys = set(diff.keys())
    # continue to next iteration if there are no meaningful fields which have changed
    if len(diff.keys()) == 0:
        continue
    # continue to next iteration if we don't have a field of interest that is changed
    if not len(fields_to_require.intersection(diff_keys)) > 1:
        continue

    # keep track of which crashes and what fields we've seen
    if not change_record["record_id"] in updated_unit_fields:
        updated_unit_fields[change_record["record_id"]] = dict()

    for field in fields_to_require:
        if field in diff:
            if field in updated_unit_fields[change_record["record_id"]]:
                continue
            else:  # we'll only visit this branch for a given crashId + field combination once
                # print(str(change_record["record_id"]) + '/' + str(field) + ': ' + str(diff[field]['old']) + ' → ' + str(diff[field]['new']))
                update = f'UPDATE atd_txdot_unit SET {field} = {diff[field]["new"]} WHERE unit_id = {change_record["record_id"]};'
                update_sql_statements.add(update)
                updated_unit_fields[change_record["record_id"]].update({field: True})

    # let user review the data for dev purposes
    # input()
    # escape + clear entire screen
    # print("\033c\x1bc")

pp.pprint(update_sql_statements)
