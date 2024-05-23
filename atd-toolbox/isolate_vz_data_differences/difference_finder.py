#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras


def align_types(db_connection_string):
    with psycopg2.connect(db_connection_string) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # Fetch column types from public.atd_txdot_crashes
            sql_public = """
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name   = 'atd_txdot_crashes'
                """
            cur.execute(sql_public)
            public_columns = {row["column_name"]: row["data_type"] for row in cur}

            # Fetch column types from data_model.crashes
            sql_data_model = """
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'data_model' 
                AND table_name   = 'crash'
                """
            cur.execute(sql_data_model)
            data_model_columns = {row["column_name"]: row["data_type"] for row in cur}

            # Compare column types
            for column, public_type in public_columns.items():
                data_model_type = data_model_columns.get(column)
                if data_model_type is None:
                    print(f"Column {column} does not exist in data_model.crashes")
                elif data_model_type != public_type:
                    print(
                        f"Column {column} type mismatch: public.atd_txdot_crashes - {public_type}, data_model.crashes - {data_model_type}"
                    )
                    alter = f"ALTER TABLE data_model.crash ALTER COLUMN {column} TYPE {public_type} USING NULLIF({column}, '')::{public_type};"
                    cur.execute(alter)
                else:
                    print(f"Column {column} types match: {public_type}")


def find_differences(db_connection_string):
    with psycopg2.connect(db_connection_string) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            sql = "select * from public.atd_txdot_crashes order by crash_date desc"
            cur.execute(sql)
            for vz_crash in cur:
                print(vz_crash["crash_id"])
                sql = "select * from data_model.crash where crash_id = %s"
                cur.execute(sql, (vz_crash["crash_id"],))
                cris_crash = cur.fetchone()
                print(cris_crash)


if __name__ == "__main__":
    db_connection_string = os.getenv("DATABASE_CONNECTION")

    if db_connection_string is None:
        raise EnvironmentError("DATABASE_CONNECTION environment variable is not set")

    # find_differences(db_connection_string)
    align_types(db_connection_string)
