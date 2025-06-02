#!/usr/bin/env python
"""
Helper script which detects changes between CRIS lookup values provided in data extract and
lookup values in the VZ database. See README.md for details.
"""
import os
import xml.etree.ElementTree as ET

from utils.graphql import (
    make_hasura_request,
    LOOKUP_TABLE_QUERY,
    LOOKUP_TABLE_VALUES_QUERY_TEMPLATE,
)

CRIS_LOOKUP_FNAME = "lookups.xml"


# veh_direction_of_force is referenced by CRIS but no longer provided in the CRIS extract
# the other tables here are custom
LOOKUP_TABLES_TO_IGNORE = [
    "veh_direction_of_force",
    "mode_category",
    "movt",
    "coordination_partners",
    "ems_patient_injry_sev",
]


def get_vz_lookup_table_names():
    data = make_hasura_request(query=LOOKUP_TABLE_QUERY)
    vz_lookup_table_names = [
        table["table_name"] for table in data["_lookup_tables_view"]
    ]
    return vz_lookup_table_names


def get_vz_lookup_table_values(table_name):
    query = LOOKUP_TABLE_VALUES_QUERY_TEMPLATE.replace("$table_name", table_name)
    data = make_hasura_request(query=query)
    return data[f"lookups_{table_name}"]


def get_cris_lookups_from_file():
    full_file_path = os.path.join("cris_data", CRIS_LOOKUP_FNAME)
    tree = ET.parse(full_file_path)
    root = tree.getroot()
    cris_lookups = {}

    for table in root.iter("LookupTable"):
        table_name = table.get("Name").replace("_LKP", "").lower()
        values = []

        for entry in table.iter("Entry"):
            id_ = int(entry.get("ID"))
            label = entry.get("Description")
            values.append({"id": id_, "label": label})

        cris_lookups[table_name] = {
            "table_name": table_name,
            "values": values,
        }
    return cris_lookups


def save_migration(content, fname):
    with open(os.path.join("migrations", fname), "w") as fout:
        fout.write(content)


def main():
    cris_lookups = get_cris_lookups_from_file()
    vz_lookup_table_names = get_vz_lookup_table_names()
    changes = []
    for table_name in vz_lookup_table_names:
        cris_lookup = cris_lookups.get(table_name)
        if not cris_lookup:
            if table_name in LOOKUP_TABLES_TO_IGNORE:
                continue
            # if this happens we'll have to figure out how to deal with this situation
            raise Exception(
                f"""Encountered a lookup table named `{table_name}` which is unknown to CRIS. 
This lookup table may be a custom lookup table which needs to be added to the `LOOKUP_TABLES_TO_IGNORE` list,
or it's possible that CRIS deleted this lookup table from it's schema.
This script cannot continue until the problem is addressed. Aborting."""
            )

        print(f"Getting lookup values for {table_name}")
        vz_values = get_vz_lookup_table_values(table_name)
        cris_values = cris_lookup["values"]
        for vz_value in vz_values:
            try:
                cris_value = next(x for x in cris_values if x["id"] == vz_value["id"])
            except StopIteration:
                if table_name == "city" and vz_value["id"] == 9999:
                    print(
                        "Skipping error for city ID 9999 - this code is still in use and is a known CRIS bug"
                    )
                    continue
                message = f"{table_name}: VZ value {vz_value['label']} ({vz_value['id']}) does not exist in CRIS"
                migration_up = (
                    f"delete from lookups.{table_name} where id = {vz_value['id']}"
                )
                migration_down = f"""insert into lookups.{table_name} (id, label, source) values ({vz_value['id']}, '{vz_value['label'].replace("'", "''")}', 'cris')"""
                changes.append(
                    {
                        "message": message,
                        "migration_up": migration_up,
                        "migration_down": migration_down,
                    }
                )
                continue

            if cris_value["label"] != vz_value["label"]:
                message = f"{table_name}: VZ value {vz_value['label']} ({vz_value['id']}) has a different label in CRIS: {cris_value['label']}"
                migration_up = f"""update lookups.{table_name} set label = '{cris_value['label'].replace("'", "''")}' where id = {cris_value['id']}"""
                migration_down = f"""update lookups.{table_name} set label = '{vz_value['label'].replace("'", "''")}' where id = {cris_value['id']}"""
                changes.append(
                    {
                        "message": message,
                        "migration_up": migration_up,
                        "migration_down": migration_down,
                    }
                )

        for cris_value in cris_values:
            try:
                vz_value = next(v for v in vz_values if v["id"] == cris_value["id"])
            except StopIteration:
                message = f"{table_name}: CRIS value {cris_value['label']} ({cris_value['id']}) does not exist in VZ"
                migration_up = f"""insert into lookups.{table_name} (id, label, source) values ({cris_value['id']}, '{cris_value['label'].replace("'", "''")}', 'cris')"""
                migration_down = (
                    f"delete from lookups.{table_name} where id = {cris_value['id']}"
                )
                changes.append(
                    {
                        "message": message,
                        "migration_up": migration_up,
                        "migration_down": migration_down,
                    }
                )
                continue
    migrations_up = [
        change["migration_up"] + ";\n" for change in changes if change["migration_up"]
    ]
    migrations_down = [
        change["migration_down"] + ";\n"
        for change in changes
        if change["migration_down"]
    ]

    if not migrations_up:
        print("No changes found ✅")
        return

    migrations_up.sort()
    migrations_down.sort()

    print(f"Saving {len(migrations_up)} migrations...")
    save_migration("".join(migrations_up), "up.sql")
    save_migration("".join(migrations_down), "down.sql")


main()
