#!/usr/bin/python3

import json

import psycopg2
from psycopg2 import extras # this feels like i should be able to just use the line above somehow

past = psycopg2.connect(
    host="localhost",
    database="past_vz",
    user="moped",
    password="")

now = psycopg2.connect(
    host="localhost",
    database="current_vz",
    user="moped",
    password="")


def get_change_events_from_past():
    sql = """
    select *,
           (((extract(hour from update_timestamp) * 60) + extract(minute from update_timestamp))/30)::integer as time_bin
    from atd_txdot_change_log
    where 1 = 1
    and record_type = 'units'
    and (((extract(hour from update_timestamp) * 60) + extract(minute from update_timestamp))/30)::integer not in (16,17,18,19,20)
    order by update_timestamp desc
    limit 1
    """
    cursor = past.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(sql)
    changes = cursor.fetchall()
    return changes

changes = get_change_events_from_past()
#print(changes)
for change in changes:
    print(change['record_json'])