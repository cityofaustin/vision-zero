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
        # print(f"Processing {public_table}, {data_model_table}, {edits_table}")
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


def retrieve_columns(conn, table_name):
    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name   = '{table_name}'
            """
        )
        return [row[0] for row in cur.fetchall()]


def get_total_records(conn, table_name):
    with conn.cursor() as cur:
        sql = f"SELECT COUNT(*) FROM public.{table_name}"
        cur.execute(sql)
        return cur.fetchone()[0]


def fetch_old_data(conn, table_name):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(f"SELECT * FROM public.{table_name} order by crash_id desc")
        rows = cur.fetchall()
        for row in rows:
            # Replace empty strings with None
            for key, value in row.items():
                if value == "":
                    row[key] = None
        return rows


def fetch_corresponding_data(conn, table_name):
    data_dict = {}
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(f"SELECT * FROM data_model.{table_name}")
        rows = cur.fetchall()
        for row in rows:
            # Replace empty strings with None
            for key, value in row.items():
                if value == "":
                    row[key] = None
            data_dict[row["crash_id"]] = row
    return data_dict


def compare_records(
    vz_record, cris_record, columns_to_skip, matching_columns, edits_columns
):
    updates = []
    # Sort matching_columns in alphabetical order
    matching_columns.sort(key=lambda x: x[0])
    for column, public_type in matching_columns:
        if column in columns_to_skip:
            continue

        if column in edits_columns and vz_record[column] != cris_record[column]:
            # print(f"Column: {column}")
            # print(f"CRIS value: {cris_record[column]}")
            # print(f"VZ value: {vz_record[column]}")
            updates.append((column, vz_record[column]))
    if len(updates) > 0:
        pass
    return updates


def update_records(conn, edits_table, updates, crash_id):
    update_sql = (
        f"UPDATE public.{edits_table} SET "
        + ", ".join(f"{column} = %s" for column, _ in updates)
        + " WHERE crash_id = %s"
    )
    params = tuple(value for _, value in updates) + (crash_id,)
    with conn.cursor() as cur:
        cur.execute(update_sql, params)
        conn.commit()


def find_differences(
    db_connection_string, public_table, data_model_table, edits_table, matching_columns
):
    columns_to_skip = ["crash_date", "crash_time"]

    with psycopg2.connect(db_connection_string) as conn:
        edits_columns = retrieve_columns(conn, edits_table)

        total_records = get_total_records(conn, public_table)
        print("Total records:", total_records)

        old_vz_data = fetch_old_data(conn, public_table)
        cris_data = fetch_corresponding_data(conn, data_model_table)

        with tqdm(
            total=total_records, desc=f"Processing {public_table}"
        ) as progress_bar:
            for vz_record in old_vz_data:
                crash_id = vz_record["crash_id"]
                cris_record = cris_data.get(crash_id)

                if cris_record is not None:
                    updates = compare_records(
                        vz_record,
                        cris_record,
                        columns_to_skip,
                        matching_columns,
                        edits_columns,
                    )
                    if updates:
                        tqdm.write(
                            f"Record {vz_record['crash_id']}: {len(updates)} changes"
                        )
                        # tqdm.write(str(updates))
                        # update_records(
                        #     conn, edits_table, updates, vz_record["crash_id"]
                        # )
                progress_bar.update(1)


if __name__ == "__main__":
    main()
