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

development_mode = True


def main():
    change_events = get_change_events_outside_etl_window()
    for change in change_events:
        find_next_state(change["record_id"], change["update_timestamp"])


def find_next_state(unit_id, update_timestamp):
    print(str(unit_id) + " " + str(update_timestamp))
    sql = f"""
    select * 
    from atd_txdot_change_log
    where 1 = 1
    and record_type = 'units'
    and record_id = {unit_id}
    and update_timestamp > '{update_timestamp}'
    order by update_timestamp asc
    limit 1
    """
    # print(sql)
    cursor = past.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql)
    changes = cursor.fetchone()
    print(changes)
    if not changes:
        print("found a 'next' record")
    else:
        print("need to get current record state")


def get_change_events_outside_etl_window():
    sql = (
        """
    select *,
           (((extract(hour from update_timestamp) * 60) + extract(minute from update_timestamp))/30)::integer as time_bin
    from atd_txdot_change_log
    where 1 = 1
    """
        # this lints strangely
        + "and record_id in (2708082, 2708098)"
        if development_mode
        else ""
        + """
    and record_type = 'units'
    and (((extract(hour from update_timestamp) * 60) + extract(minute from update_timestamp))/30)::integer not in (16,17,18,19,20)
    order by update_timestamp desc
    """
    )

    # if development_mode:
    # sql += " limit 10 "

    # and record_id = 3867282

    cursor = past.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql)
    changes = cursor.fetchall()
    return changes


if __name__ == "__main__":
    main()
