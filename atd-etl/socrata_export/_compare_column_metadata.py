#!/usr/bin/env python
"""helper to compare socrata dataset metadata between staging and prod"""
from utils.queries import QUERIES
from utils.socrata import get_socrata_client

datasets = [
    {"name": "crashes", "staging": "3aut-fhzp", "prod": "y2wy-tgr5"},
    {"name": "people", "staging": "v3x4-fjgm", "prod": "xecs-rpy9"},
]


def compare_col_arrays(list_a, list_b, a_list_name, b_list_name, primary_list="a"):
    todos = []
    for col in list_a:
        key = col["fieldName"]
        matching_col = None
        try:
            matching_col = next(
                col_to_match
                for col_to_match in list_b
                if col_to_match["fieldName"] == key
            )
        except StopIteration:
            if (primary_list == "a"):
                todo = f"- create column `{key}` type `{col['dataTypeName']}` in the {b_list_name} dataset"
                todos.append(todo)
            else:
                todo = f"- delete column `{key}` from the {b_list_name} dataset"
                todos.append(todo)
            continue
        # see if the column type is the same
        a_col_type = col["dataTypeName"]
        b_col_type = matching_col["dataTypeName"]
        if a_col_type != b_col_type:
            if primary_list == "a":
                todo = f"- change `{key}` from type `{b_col_type}` to `{a_col_type}` in the {b_list_name} dataset"
                todos.append(todo)
            else:
                # we don't need to print these type mismatches
                # todo = f"change {key} from type {a_col_type} to {b_col_type}"
                # todos.append(todo)
                continue
    return todos


def main():
    socrata_client = get_socrata_client()
    for dataset in datasets:
        print(f"\n**** {dataset['name']} dataset changes ****\n")
        cols_staging = socrata_client.get_metadata(dataset["staging"])["columns"]
        cols_prod = socrata_client.get_metadata(dataset["prod"])["columns"]
        todos = compare_col_arrays(cols_staging, cols_prod, "staging", "prod", primary_list="a")
        todos += compare_col_arrays(cols_prod, cols_staging, "staging", "prod", primary_list="b")
        todos.sort()
        print("\n".join(todos))


if __name__ == "__main__":
    main()
