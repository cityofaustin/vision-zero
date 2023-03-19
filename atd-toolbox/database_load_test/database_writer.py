#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras
import random
from dotenv import load_dotenv
from faker import Faker
from faker.providers import lorem, date_time, python, misc

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_RR_HOST = os.getenv("DB_RR_HOST")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = os.getenv("DB_PORT")


def main():
    check_sanity() # 🫠
    while True:
        create_crash_and_related_records()
        print("")

def create_crash_and_related_records():
    primary = get_primary_connection()
    primary_cursor = primary.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    # crash
    shape = get_table_shape("atd_txdot_crashes")
    insert_sql, values = build_insert_sql("atd_txdot_crashes", shape)
    primary_cursor.execute(insert_sql, values)
    new_crash = primary_cursor.fetchone()
    print("New crash: ", new_crash["crash_id"])

    # unit
    shape = get_table_shape("atd_txdot_units")
    new_units = []
    for unit_number in range(1, 4):
        insert_sql, values = build_insert_sql("atd_txdot_units", shape, {"crash_id": new_crash["crash_id"], "unit_nbr": unit_number})
        primary_cursor.execute(insert_sql, values)
        new_unit = primary_cursor.fetchone()
        new_units.append(new_unit)
        print("New unit:  ", new_unit["unit_nbr"], " Unit ID: ", new_unit["unit_id"])

    # primaryperson
    shape = get_table_shape("atd_txdot_primaryperson")
    for unit in new_units:
        insert_sql, values = build_insert_sql("atd_txdot_primaryperson", shape, {"crash_id": new_crash["crash_id"], "unit_nbr": unit["unit_nbr"]})
        primary_cursor.execute(insert_sql, values)
        new_primaryperson = primary_cursor.fetchone()
        print("New primaryperson: ", new_primaryperson["primaryperson_id"])

    # primaryperson
    shape = get_table_shape("atd_txdot_person")
    # print("Shape: ", shape)
    for unit in new_units:
        for person_number in range(1, 3):
            insert_sql, values = build_insert_sql("atd_txdot_person", shape, {"crash_id": new_crash["crash_id"], "unit_nbr": unit["unit_nbr"]})
            # print("SQL: ", insert_sql)
            # print("Values: ", values)
            primary_cursor.execute(insert_sql, values)
            new_person = primary_cursor.fetchone()
            print("New person: ", new_person["person_id"])
    primary.commit()

def check_sanity():
    print("Ask yourself: Am I very sure this isn't pointed at a production database?")
    print("This program creates random records in the database.")
    print("DB_HOST: ", DB_HOST)
    print("")
    if "test" not in DB_HOST:
        print("DB_HOST does not contain the string 'test'.")
        input("Press Enter to continue...")
        quit()


def get_primary_connection():
    # print("DB_HOST: ", DB_HOST)
    primary = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USERNAME,
        password=DB_PASSWORD,
        dbname=DB_DATABASE,
        sslmode="require",
    )
    return primary


def get_rr_connection():
    # print("DB_RR_HOST: ", DB_RR_HOST)
    rr = psycopg2.connect(
        host=DB_RR_HOST,
        port=DB_PORT,
        user=DB_USERNAME,
        password=DB_PASSWORD,
        dbname=DB_DATABASE,
        sslmode="require",
    )
    return rr


def get_table_shape(table):
    primary = get_primary_connection()
    table_shape_sql = f"""
    SELECT
        column_name, 
        ordinal_position, 
        data_type, 
        character_maximum_length, 
        numeric_precision,
        numeric_scale
    FROM information_schema.columns
    WHERE true
        AND table_schema = 'public'
        AND table_name   = '{table}';
    """
    # print("Table shape SQL: ", table_shape_sql)

    cursor = primary.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(table_shape_sql)
    table_shape = cursor.fetchall()
    return table_shape


def build_insert_sql(table, shape, overrides={}):
    fields = []
    values = []
    placeholders = []
    for field in shape:
        # print("Field: ", field["column_name"])
        # print("Type:  ", field["data_type"])

        # 🤖 🦾 Copilot was made for this sort of thing
        if field["column_name"] in overrides:
            fields.append(field["column_name"])
            values.append(overrides[field["column_name"]])
            placeholders.append("%s")

        elif field["column_name"] in ["years_of_life_lost", "unit_id", "primaryperson_id", "person_id"]: # generated or sequence driven fields
            pass

        elif table == "atd_txdot_person" and field["column_name"] == "prsn_injry_sev_id":
            fields.append(field["column_name"])
            values.append(random.choice([0,2,3,4,5,1]))
            placeholders.append("%s")

        elif table == "atd_txdot_crashes" and field["column_name"] == "crash_id":
            fields.append(field["column_name"])
            values.append(get_next_crash_id())
            placeholders.append("%s")

        elif table == "atd_txdot_crashes" and field["column_name"] == "position":
            fields.append(field["column_name"])
            placeholders.append(random_position())

        elif field["data_type"] == "character varying":
            fields.append(field["column_name"])
            values.append(random_character_varying(field))
            placeholders.append("%s")

        elif field["data_type"] == "integer":
            fields.append(field["column_name"])
            values.append(random_integer(field))
            placeholders.append("%s")

        elif field["data_type"] == "date":
            fields.append(field["column_name"])
            values.append(random_date(field))
            placeholders.append("%s")

        elif field["data_type"] == "timestamp with time zone":
            fields.append(field["column_name"])
            values.append(random_timestamp_with_time_zone(field))
            placeholders.append("%s")

        elif field["data_type"] == "timestamp without time zone":
            fields.append(field["column_name"])
            values.append(random_timestamp_without_time_zone(field))
            placeholders.append("%s")

        elif field["data_type"] == "time with time zone":
            fields.append(field["column_name"])
            values.append(random_time_with_time_zone(field))
            placeholders.append("%s")

        elif field["data_type"] == "time without time zone":
            fields.append(field["column_name"])
            values.append(random_time_without_time_zone(field))
            placeholders.append("%s")

        elif field["data_type"] == "double precision":
            fields.append(field["column_name"])
            values.append(random_double_precision(field))
            placeholders.append("%s")

        elif field["data_type"] == "text":
            fields.append(field["column_name"])
            values.append(random_text(field))
            placeholders.append("%s")

        elif field["data_type"] == "boolean":
            fields.append(field["column_name"])
            values.append(random_boolean(field))
            placeholders.append("%s")

        elif field["data_type"] == "numeric":
            fields.append(field["column_name"])
            values.append(random_numeric(field))
            placeholders.append("%s")

        elif field["data_type"] == "json":
            fields.append(field["column_name"])
            values.append(random_json(field))
            placeholders.append("%s")

        elif field["data_type"] == "jsonb":
            fields.append(field["column_name"])
            values.append(random_jsonb(field))
            placeholders.append("%s")

        else:
            print("We don't know how to handle this type: ", field["data_type"])
            quit()

    insert_sql = f"insert into {table} ({', '.join(fields)}) values ({', '.join(placeholders)}) returning *"
    return (insert_sql, values)


def random_character_varying(field):
    fake = Faker()
    fake.add_provider(lorem)
    string = fake.paragraph()[: field["character_maximum_length"]]
    return string


def random_integer(field):
    precision = field["numeric_precision"] - 1
    integer = random.randint(0, 2**precision)
    return integer


def random_date(field):
    fake = Faker()
    fake.add_provider(date_time)
    date = fake.date_this_year()
    return date


def random_timestamp_with_time_zone(field):
    fake = Faker()
    fake.add_provider(date_time)
    timestamp = fake.date_time_this_year()
    return timestamp


def random_timestamp_without_time_zone(field):
    return random_timestamp_with_time_zone(field)


def random_time_with_time_zone(field):
    fake = Faker()
    fake.add_provider(date_time)
    time = fake.time()


def random_time_without_time_zone(field):
    return random_time_with_time_zone(field)


def random_double_precision(field):
    fake = Faker()
    fake.add_provider(python)
    float = fake.pyfloat()


def random_text(field):
    fake = Faker()
    fake.add_provider(lorem)
    string = "\n".join(fake.paragraphs(nb=5))
    return string


def random_boolean(field):
    fake = Faker()
    fake.add_provider(python)
    boolean = fake.pybool()
    return boolean


def random_numeric(field):
    if not field["numeric_scale"]:
        field["numeric_scale"] = 2
    if not field["numeric_precision"]:
        field["numeric_precision"] = 10
    precision = field["numeric_precision"] - field["numeric_scale"]
    fake = Faker()
    fake.add_provider(python)
    # these names feel backwards, but this is what it is
    numeric = fake.pyfloat(left_digits=precision, right_digits=field["numeric_scale"])
    return numeric


def random_json(field):
    fake = Faker()
    fake.add_provider(misc)
    json = fake.json()
    return json


def random_jsonb(field):
    return random_json(field)


def random_position():
    latitude = 30.274722 + random.uniform(-0.1, 0.1)
    longitude = -97.740556 + random.uniform(-0.1, 0.1)
    position = f"ST_GeomFromEWKT('SRID=4326;POINT({longitude} {latitude})')"
    return position
    pass


def get_next_crash_id():
    primary = get_primary_connection()
    cursor = primary.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT max(crash_id)+1 as next_id FROM atd_txdot_crashes;")
    next_crash_id = cursor.fetchone()["next_id"]
    return next_crash_id


if __name__ == "__main__":
    main()
