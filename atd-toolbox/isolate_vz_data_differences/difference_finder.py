#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras
from tqdm import tqdm
import json

# TODO: Fix the ID'ing of columns among the sets
# TODO: Combine Primary and Normal Persons in the output table
# TODO: Combine the crash date and time into a unified column


def main():
    db_connection_string = os.getenv("DATABASE_CONNECTION")

    if db_connection_string is None:
        raise EnvironmentError("DATABASE_CONNECTION environment variable is not set")

    table_sets = [
        # (
        #     "atd_txdot_crashes",
        #     "crash",
        #     "crashes_cris",
        #     "crashes_edits",
        #     "crash_id",
        #     ("crash_id",),
        # ),
        (
            "atd_txdot_units",
            "unit",
            "units_cris",
            "units_edits",
            "id",
            ("crash_id", "unit_nbr"),
        ),
        # ("atd_txdot_persons", "person", "persons_edits", "id"),
        # ("atd_txdot_primarypersons", "primaryperson", "primarypersons_edits", "id"),
    ]

    for (
        public_table,
        data_model_table,
        cris_table,
        edits_table,
        id_column,
        unique_identifiers,
    ) in table_sets:
        matching_columns = align_types(
            db_connection_string, public_table, data_model_table
        )
        find_differences(
            db_connection_string,
            public_table,
            data_model_table,
            cris_table,
            edits_table,
            matching_columns,
            id_column,
            unique_identifiers,
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
        cur.execute(f"SELECT * FROM public.{table_name}")
        rows = cur.fetchall()
        for row in rows:
            # Replace empty strings with None
            for key, value in row.items():
                if value == "":
                    row[key] = None
        return rows


def fetch_corresponding_data(conn, table_name, unique_identifiers):
    data_dict = {}
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(f"SELECT * FROM data_model.{table_name}")
        rows = cur.fetchall()
        for row in rows:
            # Replace empty strings with None
            for key, value in row.items():
                if value == "":
                    row[key] = None
            # Generate a tuple of values for the unique identifiers
            unique_values = tuple(row[id_column] for id_column in unique_identifiers)
            data_dict[unique_values] = row
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

        if (
            column in edits_columns
            and vz_record[column] != cris_record[column]
            # the following condition would result in a field being set to /null/ in the vz table which is a non-op
            # but the condition is included here for clarity in how fields which are added in more recent schemata are handled.
            and not (
                column == "rpt_autonomous_level_engaged_id"
                and vz_record[column] is None
            )
        ):
            updates.append((column, vz_record[column]))

    return updates


def update_records(
    conn, edits_table, cris_table, updates, unique_identifiers, unique_values
):
    id_column = "crash_id" if cris_table == "crashes_cris" else "id"
    subquery = f"SELECT {id_column} FROM public.{cris_table} WHERE " + " AND ".join(
        f"{id_column} = %s" for id_column in unique_identifiers
    )
    update_sql = (
        f"UPDATE public.{edits_table} SET "
        + ", ".join(f"{column} = %s" for column, _ in updates)
        + f" WHERE {id_column} = ({subquery})"
    )
    params = tuple(value for _, value in updates) + unique_values
    with conn.cursor() as cur:
        try:
            cur.execute(update_sql, params)
            updated_rows = cur.rowcount
            if updated_rows != 1:
                raise Exception()
        except Exception:
            interpolated_query = cur.mogrify(update_sql, params).decode()
            updates_str = ", ".join(f"{column} = {value}" for column, value in updates)
            raise Exception(
                f"Expected to update 1 row, but updated another number of rows.\n"
                f"Query: {interpolated_query}\n"
                f"Updates: {updates_str}"
            )
        conn.commit()


def find_differences(
    db_connection_string,
    public_table,
    data_model_table,
    cris_table,
    edits_table,
    matching_columns,
    id_column,
    unique_identifiers,
):
    columns_to_skip = ["crash_date", "crash_time"]

    with psycopg2.connect(db_connection_string) as conn:
        edits_columns = retrieve_columns(conn, edits_table)

        total_records = get_total_records(conn, public_table)
        print("Total records:", total_records)

        old_vz_data = fetch_old_data(conn, public_table)
        cris_data = fetch_corresponding_data(conn, data_model_table, unique_identifiers)

        with tqdm(
            total=total_records, desc=f"Processing {public_table}"
        ) as progress_bar:
            for vz_record in old_vz_data:
                # Generate a tuple of values for the unique identifiers
                unique_values = tuple(
                    vz_record[id_column] for id_column in unique_identifiers
                )
                cris_record = cris_data.get(unique_values)

                if cris_record is not None:
                    updates = compare_records(
                        vz_record,
                        cris_record,
                        columns_to_skip,
                        matching_columns,
                        edits_columns,
                    )
                    if updates:
                        unique_values_str = ", ".join(
                            str(vz_record[id_column])
                            for id_column in unique_identifiers
                        )
                        tqdm.write(
                            f"Record ({unique_values_str}) change count: {len(updates)} "
                        )
                        updates_dict = dict(updates)
                        updates_json = json.dumps(updates_dict, indent=4)
                        tqdm.write(updates_json)

                        # for field, vz_value in updates:
                        #     cris_value = cris_record.get(field)
                        #     tqdm.write(f"Field: {field}")
                        #     tqdm.write(f"VZ value: {vz_value}")
                        #     tqdm.write(f"CRIS value: {cris_value}")
                        # input()
                        update_records(
                            conn,
                            edits_table,
                            cris_table,
                            updates,
                            unique_identifiers,
                            unique_values,
                        )
                progress_bar.update(1)


if __name__ == "__main__":
    main()
