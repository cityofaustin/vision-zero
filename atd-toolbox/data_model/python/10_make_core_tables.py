import csv
import io
from pprint import pprint as print

import requests

from settings import COLUMN_ENDPOINT, SCHEMA_NAME
from utils import (
    make_migration_dir,
    delete_all_migrations,
    save_file,
    save_empty_down_migration,
)


def load_columns(endpoint):
    res = requests.get(endpoint)
    res.raise_for_status()
    fin = io.StringIO(res.text)
    reader = csv.DictReader(fin)
    return [row for row in reader]


def load_sql_template(name):
    with open(name, "r") as fin:
        return fin.read()


def get_lookup_table_names(data):
    """Extract lookup table names from column data"""
    lookup_table_names = [
        f"{row['foreign_table_schema']}.{row['foreign_table_name']}"
        for row in data
        if row["foreign_table_name"]
        and row["action"].startswith("migr")
        and not row["foreign_table_name"].endswith("_cris")
        and not row["foreign_table_name"].endswith("_edits")
        and not row["foreign_table_name"].endswith("_unified")
        and not row["is_existing_foreign_table"] == "TRUE"
    ]
    return sorted(list(set(lookup_table_names)))


def make_lookup_table_sql(table_names):
    create_table_stmts = []
    for table_name in table_names:
        sql = f"create table {table_name} (\n    id integer primary key,\n    label text not null,\n    source text not null default 'cris'\n);"
        create_table_stmts.append(sql)
    return "\n\n".join(create_table_stmts)


def make_column_sql(columns, full_table_name):
    sql_parts = []
    for col in columns:
        column_name = col["column_name"]
        data_type = col["data_type_new"]
        constraint = col["data_type_constraint"]
        fk_table_name = col["foreign_table_name"]
        fk_cascade = col["foreign_column_cascade"]
        fk_column_name = col["foreign_column_name"]
        fk_schema_name = col["foreign_table_schema"] or "public"
        if constraint == "primary key" and not full_table_name.endswith("_cris"):
            # hacky logic to manage id sequences and pks on the _edits and _unified tables
            if data_type == "serial":
                data_type = "integer"
            if full_table_name.endswith("_edits"):
                fk_table_name = full_table_name.replace("_edits", "_cris")
            elif full_table_name.endswith("_unified") and "crashes" in full_table_name:
                fk_table_name = full_table_name.replace("_unified", "_cris")
            # column name is always the same as the column name
            fk_column_name = column_name
            fk_cascade = "on update cascade on delete cascade"
        elif column_name == "crash_id":
            if full_table_name == "units_edits":
                # make nullable
                constraint = ""
                # reference units_cris
                fk_table_name = "crashes_cris"
            elif full_table_name == "units_unified":
                fk_table_name = "crashes_unified"
        elif column_name == "unit_id":
            if full_table_name == "people_edits":
                # make nullable
                constraint = ""
                # reference units_cris
                fk_table_name = "units_cris"
            elif full_table_name == "people_unified":
                fk_table_name = "units_unified"
            fk_cascade = "on update cascade on delete cascade"
        elif column_name == "people_id":
            if full_table_name == "charges_edits":
                # reference units_cris
                # make nullable
                constraint = ""
                fk_table_name = "charges_cris"
            elif full_table_name == "charges_unified":
                fk_table_name = "people_unified"
            fk_cascade = "on update cascade on delete cascade"

        sql = f"{column_name} {data_type} {constraint}".strip()
        if fk_table_name:
            sql = f"{sql} references {fk_schema_name}.{fk_table_name} ({fk_column_name}) {fk_cascade}"
        sql_parts.append(sql)
    return ",\n    ".join(sql_parts)


def main():
    delete_all_migrations()
    print("downloading metadata from google sheet...")
    data = load_columns(COLUMN_ENDPOINT)
    print("doing everything else...")
    # init the schema
    migration_path = make_migration_dir("create_schema")
    save_file(
        f"{migration_path}/up.sql",
        f"create schema if not exists lookups;",
    )
    save_file(
        f"{migration_path}/down.sql",
        f"drop schema if exists lookups cascade;",
    )
    # lookup tables
    lookup_table_names = get_lookup_table_names(data)
    lookup_tables_sql = make_lookup_table_sql(lookup_table_names)
    migration_path = make_migration_dir("lookups")
    save_file(f"{migration_path}/up.sql", lookup_tables_sql)
    # we don't write down migrations for each lookup table—we drop the whole lookups schema
    save_empty_down_migration(migration_path)
    for table_name in ["crashes", "units", "people", "charges"]:
        tables_sql_stmts = []
        table_sql_down_stmts = []
        for table_suffix in ["cris", "edits", "unified"]:
            if table_name == "charges" and table_suffix != "cris":
                # charges is a cris-only table
                continue
            column_table_key = f"table_name_new_{table_suffix}"
            full_table_name = f"{table_name}_{table_suffix}"
            columns = [
                col
                for col in data
                if col[column_table_key] == full_table_name
                and col["action"] == "migrate"
            ]
            # sort primary key first, then by column name
            columns = sorted(
                columns,
                key=lambda col: (
                    "a" if "primary" in col["data_type_constraint"] else "b",
                    col["column_name"],
                ),
            )
            unique_cols = set()
            # dedupe columns, which is only needed for primary/person tables
            columns = [
                c
                for c in columns
                if not (
                    c["column_name"] in unique_cols or unique_cols.add(c["column_name"])
                )
            ]
            column_sql_str = make_column_sql(columns, full_table_name)
            table_sql_str = f"create table {SCHEMA_NAME}.{full_table_name} (\n    {column_sql_str}\n);"
            tables_sql_stmts.append(table_sql_str)
            table_sql_down_stmts.append(f"drop table {SCHEMA_NAME}.{full_table_name} cascade;")
        tables_sql_str = "\n\n".join(tables_sql_stmts)
        table_sql_down_str = "\n\n".join(table_sql_down_stmts)
        migration_path = make_migration_dir(table_name)
        save_file(f"{migration_path}/up.sql", tables_sql_str)
        save_file(f"{migration_path}/down.sql", table_sql_down_str)

    table_constraints_sql = load_sql_template("./sql_templates/table_constraints.sql")
    migration_path = make_migration_dir("table_constraints")
    save_file(f"{migration_path}/up.sql", table_constraints_sql)
    save_empty_down_migration(migration_path)

main()
