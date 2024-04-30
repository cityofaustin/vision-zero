import csv
import io

import requests

from settings import SCHEMA_NAME, COLUMN_ENDPOINT
from utils import save_file, make_migration_dir, save_empty_down_migration


def load_columns(endpoint):
    res = requests.get(endpoint)
    res.raise_for_status()
    fin = io.StringIO(res.text)
    reader = csv.DictReader(fin)
    return [row for row in reader]


def load_sql_template(name):
    with open(name, "r") as fin:
        return fin.read()


def patch_template(template, table_name, pk_column_name, columns_unified):
    affected_columns_with_new_prefix = [f"new.{col}" for col in columns_unified]

    return (
        template.replace("$tableName$", table_name)
        .replace("$pkColumnName$", pk_column_name)
        .replace("$affectedColumns$", ", ".join(columns_unified))
        .replace(
            "$affectedColumnsWithNewPrefix$",
            ", ".join(affected_columns_with_new_prefix),
        )
    )


def main():
    data = load_columns(COLUMN_ENDPOINT)

    # triggers that fire on CRIS insert
    insert_template = load_sql_template(
        "sql_templates/cris_insert_trigger_template.sql"
    )

    stmts = []
    for table_name in ["crashes", "units", "people"]:
        columns_unified = [
            col["column_name"]
            for col in data
            if col["table_name_new_cris"] == f"{table_name}_cris"
            and col["table_name_new_unified"] == f"{table_name}_unified"
            and col["action"] == "migrate"
        ]
        # remove dupes, which is a concern for persons tables
        columns_unified = list(set(columns_unified))
        pk_column = "crash_id" if table_name == "crashes" else "id"
        sql = patch_template(insert_template, table_name, pk_column, columns_unified)
        stmts.append(sql)

    migration_path = make_migration_dir("cris_insert_triggers")
    save_file(f"{migration_path}/up.sql", "\n\n".join(stmts))
    save_empty_down_migration(migration_path)

    # triggers that fire on CRIS update
    update_template = load_sql_template(
        "sql_templates/cris_update_trigger_template.sql"
    )

    stmts = []
    for table_name in ["crashes", "units", "people"]:
        pk_column = "crash_id" if table_name == "crashes" else "id"
        sql = patch_template(update_template, table_name, pk_column, [])
        stmts.append(sql)

    migration_path = make_migration_dir("cris_update_triggers")
    save_file(f"{migration_path}/up.sql", "\n\n".join(stmts))
    save_empty_down_migration(migration_path)

    # triggers that fire on _edits update
    update_template = load_sql_template(
        "sql_templates/edits_update_trigger_template.sql"
    )

    stmts = []
    for table_name in ["crashes", "units", "people"]:
        pk_column = "crash_id" if table_name == "crashes" else "id"
        sql = patch_template(update_template, table_name, pk_column, [])
        stmts.append(sql)

    migration_path = make_migration_dir("edits_update_triggers")
    save_file(f"{migration_path}/up.sql", "\n\n".join(stmts))
    save_empty_down_migration(migration_path)

    # trigger that assigns unit ID to person records
    people_set_unit_id_sql = load_sql_template("sql_templates/people_set_unit_id.sql")
    migration_path = make_migration_dir("people_set_unit_id")
    save_file(f"{migration_path}/up.sql", people_set_unit_id_sql)
    save_empty_down_migration(migration_path)

    # trigger that assigns person ID to charges records
    people_set_unit_id_sql = load_sql_template(
        "sql_templates/charges_set_person_id.sql"
    )
    migration_path = make_migration_dir("charges_set_person_id")
    save_file(f"{migration_path}/up.sql", people_set_unit_id_sql)
    save_empty_down_migration(migration_path)

    # trigger that assigns location ID to unified crashes
    location_trigger_sql = load_sql_template(
        "sql_templates/crash_reference_layer_triggers.sql"
    )
    migration_path = make_migration_dir("crash_reference_layer_triggers")
    save_file(f"{migration_path}/up.sql", location_trigger_sql)
    save_empty_down_migration(migration_path)


main()
