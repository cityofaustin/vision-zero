import csv
import io
from pprint import pprint as print

import requests

from settings import LOOKUP_SEEDS_ENDPOINT, SCHEMA_NAME
from utils import (
    make_migration_dir,
    save_file,
    save_empty_down_migration,
)


def load_data(endpoint):
    res = requests.get(endpoint)
    res.raise_for_status()
    fin = io.StringIO(res.text)
    reader = csv.DictReader(fin)
    return [row for row in reader]


def make_lookup_table_sql(table_names):
    create_table_stmts = []
    for table_name in table_names:
        sql = f"create table {table_name} (\n    id integer primary key,\n    label text not null\n);"
        create_table_stmts.append(sql)
    return "\n\n".join(create_table_stmts)


def escape_single_quotes(input_string):
    return input_string.replace("'", "''")


veh_direction_of_force_lkp_values = """insert into lookups.veh_direction_of_force_lkp (id, label)
    select veh_direction_of_force_id, veh_direction_of_force_desc from atd_txdot__veh_direction_of_force_lkp;"""

mode_category_lkp_values = """insert into lookups.mode_category_lkp (id, label)
    select  id, atd_mode_category_mode_name from atd__mode_category_lkp;"""

city_id_patch = """insert into lookups.city_lkp (id, label) values (9999, 'UNKNOWN')"""

def main():
    print("downloading metadata from google sheet...")
    schema_name = "lookups"
    data = load_data(LOOKUP_SEEDS_ENDPOINT)
    insert_stmts = []
    for row in data:
        stmt = f"insert into {schema_name}.{row['table_name']} (id, label) values ({row['id']}, '{escape_single_quotes(row['label'])}');"
        insert_stmts.append(stmt)
    # copy lookup table because it's not in the extract CSV lookup file
    insert_stmts.append(veh_direction_of_force_lkp_values)
    # copy lookup table because it's custom
    insert_stmts.append(mode_category_lkp_values)
    # adds backward compatibility to city ID 9999
    insert_stmts.append(city_id_patch)
    sql = "\n".join(insert_stmts)
    migration_path = make_migration_dir("lookup_table_seeds")
    save_file(f"{migration_path}/up.sql", sql)
    save_empty_down_migration(migration_path)


main()
