#!/usr/bin/env python
"""what about if a foreign key column name changes?"""
import os
import xml.etree.ElementTree as ET

from utils.graphql import (
    make_hasura_request,
    LOOKUP_TABLE_QUERY,
    LOOKUP_TABLE_VALUES_QUERY_TEMPLATE,
)

CRIS_LOOKUP_FNAME = "lookups.xml"


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


def main():
    cris_lookups = get_cris_lookups_from_file()
    vz_lookup_table_names = get_vz_lookup_table_names()
    for table_name in vz_lookup_table_names:
        cris_lookup = cris_lookups.get(table_name)
        if not cris_lookup:
            print(f"skip {table_name}")
            continue
        print(f"getting values for {table_name}")
        vz_values = get_vz_lookup_table_values(table_name)
        cris_values = cris_lookup["values"]
        for vz_value in vz_values:
            try:
                cris_value = next(x for x in cris_values if x["id"] == vz_value["id"])
            except StopIteration:
                print(f"no cris ID match for table {table_name}: {vz_value}!")
                continue

            if cris_value["label"] != vz_value["label"]:
                print("value mismatch")

    breakpoint()
    return


main()
