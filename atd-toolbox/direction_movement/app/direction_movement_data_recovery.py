#!/usr/bin/python3

#import json

import pprint
import psycopg2
from psycopg2 import extras # this feels like i should be able to just use the line above somehow

# fields we're not going to worry about
fields_to_skip = {"last_update", "updated_by"}

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
    for key in previous_record.keys():
        if previous_record[key] != current_value[key]:
            if key in fields_to_skip:
                continue
            if ( (previous_record[key] is None and current_value[key] == '') 
                   or 
                 (previous_record[key] == '' and current_value[key] is None) ):
                continue
            changes[key] = {'old': previous_record[key], 'new': current_value[key]} 
    return changes

pp = pprint.PrettyPrinter(indent=2)

change_records = get_change_events_from_past()
for change_record in change_records:
    diff = check_current_state(change_record['record_id'], change_record['record_json'])
    if len(diff.keys()) == 0:
        continue
    pp.pprint(diff)
    input()
    print(chr(27)+'[2j')
    print('\033c')
    print('\x1bc')