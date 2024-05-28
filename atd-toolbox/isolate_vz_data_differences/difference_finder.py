#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras
from tqdm import tqdm

# TODO: Fix the ID'ing of columns among the sets
# TODO: Combine Primary and Normal Persons in the output table
# TODO: Combine the crash date and time into a unified column


def main():
    db_connection_string = os.getenv("DATABASE_CONNECTION")

    if db_connection_string is None:
        raise EnvironmentError("DATABASE_CONNECTION environment variable is not set")

    table_sets = [
        ("atd_txdot_crashes", "crash", "crashes_edits"),
        # ("atd_txdot_units", "unit", "units_edits"),
        # ("atd_txdot_persons", "person", "persons_edits"),
        # ("atd_txdot_primarypersons", "primaryperson", "primarypersons_edits"),
    ]

    for public_table, data_model_table, edits_table in table_sets:
        print(f"Processing {public_table}, {data_model_table}, {edits_table}")
        matching_columns = align_types(
            db_connection_string, public_table, data_model_table
        )
        find_differences(
            db_connection_string,
            public_table,
            data_model_table,
            edits_table,
            matching_columns,
        )


def align_types(db_connection_string, public_table, data_model_table):
    with psycopg2.connect(db_connection_string) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # Fetch column types from public table
            sql_public = f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name   = '{public_table}'
                """
            cur.execute(sql_public)
            public_columns = {row["column_name"]: row["data_type"] for row in cur}

            # Fetch column types from data_model table
            sql_data_model = f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'data_model' 
                AND table_name   = '{data_model_table}'
                """
            cur.execute(sql_data_model)
            data_model_columns = {row["column_name"]: row["data_type"] for row in cur}

            # Compare column types
            for column, public_type in public_columns.items():
                data_model_type = data_model_columns.get(column)
                if data_model_type is None:
                    print(
                        f"Column {column} does not exist in data_model.{data_model_table}"
                    )
                elif data_model_type != public_type:
                    print(
                        f"Column {column} type mismatch: public.{public_table} - {public_type}, data_model.{data_model_table} - {data_model_type}"
                    )
                    alter = f"ALTER TABLE data_model.{data_model_table} ALTER COLUMN {column} TYPE {public_type} USING NULLIF({column}, '')::{public_type};"
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


def find_differences(
    db_connection_string, public_table, data_model_table, edits_table, matching_columns
):
    columns_to_skip = [
        "crash_date",
        "crash_time",
    ]  # these are only in the crashes table so no harm in "skipping" them in the other tables

    with psycopg2.connect(db_connection_string) as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name   = '{edits_table}'
                """
            )
            edits_columns = [row[0] for row in cur.fetchall()]

            # Get the total count of records in the table
            cur.execute(f"SELECT COUNT(*) FROM public.{public_table}")
            total_records = cur.fetchone()[0]

        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as old_data:
            sql = f"SELECT * FROM public.{public_table}"
            old_data.execute(sql)

            with tqdm(
                total=total_records, desc=f"Processing {public_table}"
            ) as progress_bar:
                for vz_record in old_data:
                    updates = []
                    with conn.cursor(
                        cursor_factory=psycopg2.extras.DictCursor
                    ) as cris_data:
                        sql = f"SELECT * FROM data_model.{data_model_table} WHERE crash_id = %s"
                        cris_data.execute(sql, (vz_record["crash_id"],))
                        cris_record = cris_data.fetchone()
                        if cris_record is not None:
                            for column, public_type in matching_columns:
                                if column in columns_to_skip:
                                    continue
                                if (
                                    column in edits_columns
                                    and vz_record[column] != cris_record[column]
                                ):
                                    updates.append((column, vz_record[column]))

                    if updates:
                        tqdm.write(
                            f"Record {vz_record['crash_id']}: {len(updates)} changes"
                        )
                        update_sql = (
                            f"UPDATE public.{edits_table} SET "
                            + ", ".join(f"{column} = %s" for column, _ in updates)
                            + " WHERE crash_id = %s"
                        )
                        params = tuple(value for _, value in updates) + (
                            vz_record["crash_id"],
                        )
                        with conn.cursor() as cur:
                            cur.execute(update_sql, params)
                            conn.commit()

                    # Update tqdm progress bar
                    progress_bar.update(1)


if __name__ == "__main__":
    main()
