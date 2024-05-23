#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras
from tqdm import tqdm


def main():
    db_connection_string = os.getenv("DATABASE_CONNECTION")

    if db_connection_string is None:
        raise EnvironmentError("DATABASE_CONNECTION environment variable is not set")

    matching_columns = align_types(db_connection_string)
    find_differences_write_update_log(db_connection_string, matching_columns)


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

            # Compare column types
            common_columns = []
            for column, public_type in public_columns.items():
                data_model_type = data_model_columns.get(column)
                if data_model_type is not None:
                    common_columns.append((column, public_type))

            return common_columns


def find_differences_write_update_log(db_connection_string, matching_columns):
    columns_to_skip = ["crash_date", "crash_time"]

    with psycopg2.connect(db_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name   = 'crashes_edits'
                """
            )
            crashes_edits_columns = [row[0] for row in cur.fetchall()]

            # Get the total count of records in the table
            cur.execute("SELECT COUNT(*) FROM public.atd_txdot_crashes")
            total_crashes = cur.fetchone()[0]

        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as old_data:
            sql = "select * from public.atd_txdot_crashes order by crash_date desc"
            old_data.execute(sql)

            with tqdm(total=total_crashes, desc="Processing crashes") as pbar:
                for vz_crash in old_data:
                    updates = []
                    with conn.cursor(
                        cursor_factory=psycopg2.extras.DictCursor
                    ) as cris_data:
                        sql = "select * from data_model.crash where crash_id = %s"
                        cris_data.execute(sql, (vz_crash["crash_id"],))
                        cris_crash = (
                            cris_data.fetchone()
                        )  # Changed from old_data to cris_data
                        if cris_crash is not None:
                            for column, public_type in matching_columns:
                                if column in columns_to_skip:
                                    continue
                                if (
                                    column in crashes_edits_columns
                                    and vz_crash[column] != cris_crash[column]
                                ):
                                    updates.append((column, vz_crash[column]))

                    if updates:
                        tqdm.write(
                            f"Crash {vz_crash['crash_id']}: {len(updates)} changes"
                        )
                        update_sql = (
                            "update public.crashes_edits set "
                            + ", ".join(f"{column} = %s" for column, _ in updates)
                            + " where crash_id = %s"
                        )
                        params = tuple(value for _, value in updates) + (
                            vz_crash["crash_id"],
                        )
                        with conn.cursor() as cur:
                            cur.execute(update_sql, params)
                            conn.commit()

                    # Update tqdm progress bar
                    pbar.update(1)


if __name__ == "__main__":
    main()
