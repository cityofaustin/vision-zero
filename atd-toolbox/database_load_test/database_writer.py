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
    pass

if __name__ == "__main__":
    main()