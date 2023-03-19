#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_RR_HOST = os.getenv("DB_RR_HOST")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = os.getenv("DB_PORT")

def main():
    tables = ["atd_txdot_crashes"]
    for table in tables:
        print("Table: ", table)
        shape = get_table_shape(table)
        # print("Shape: ", shape)
        insert_sql = build_insert_sql(table, shape)

def get_primary_connection():
    # print("DB_HOST: ", DB_HOST)
    primary = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USERNAME, 
        password=DB_PASSWORD, 
        dbname=DB_DATABASE, 
        sslmode="require" 
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
        sslmode="require" 
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

def build_insert_sql(table, shape):
    fields = []
    values = []
    for field in shape:
        print("Field: ", field["column_name"])
        print("Type:  ", field["data_type"])
        if field["data_type"] == 'character varying':
            fields.append(field["column_name"])
            values.append(random_character_varying())
        elif field["data_type"] == 'integer':
            fields.append(field["column_name"])
            values.append(random_integer())
        elif field["data_type"] == 'date':
            fields.append(field["column_name"])
            values.append(random_date())
        elif field["data_type"] == 'timestamp with time zone':
            fields.append(field["column_name"])
            values.append(random_timestamp_with_time_zone())
        elif field["data_type"] == 'timestamp without time zone':
            fields.append(field["column_name"])
            values.append(random_timestamp_without_time_zone())
        elif field["data_type"] == 'time with time zone':
            fields.append(field["column_name"])
            values.append(random_time_with_time_zone())
        elif field["data_type"] == 'time without time zone':
            fields.append(field["column_name"])
            values.append(random_time_without_time_zone())
        elif field["data_type"] == 'double precision':
            fields.append(field["column_name"])
            values.append(random_double_precision())
        elif field["data_type"] == 'text':
            fields.append(field["column_name"])
            values.append(random_text())
        elif field["data_type"] == 'boolean':
            fields.append(field["column_name"])
            values.append(random_boolean())
        elif field["data_type"] == 'numeric':
            fields.append(field["column_name"])
            values.append(random_numeric())
        elif field["data_type"] == 'json':
            fields.append(field["column_name"])
            values.append(random_json())
        elif field["data_type"] == 'jsonb':
            fields.append(field["column_name"])
            values.append(random_jsonb())
        elif table == 'atd_txdot_crashes' and field["column_name"] == 'position':
            fields.append(field["column_name"])
            values.append(random_position())
        else:
            quit()
    print("Done")

def random_character_varying():
    pass

def random_integer():
    pass

def random_date():
    pass

def random_timestamp_with_time_zone():
    pass

def random_timestamp_without_time_zone():
    pass

def random_time_with_time_zone():
    pass

def random_time_without_time_zone():
    pass

def random_double_precision():
    pass

def random_text():
    pass

def random_boolean():
    pass

def random_numeric():
    pass

def random_json():
    pass

def random_jsonb():
    pass

def random_position():
    pass


if __name__ == "__main__":
    main()