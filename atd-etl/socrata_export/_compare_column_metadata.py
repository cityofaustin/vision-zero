#!/usr/bin/env python
"""helper to compare socrata dataset metadata between staging and prod"""
from utils.queries import QUERIES
from utils.socrata import get_socrata_client

datasets = [
    {"name": "crashes", "staging": "3aut-fhzp", "prod": "y2wy-tgr5"},
    {"name": "people", "staging": "v3x4-fjgm", "prod": "xecs-rpy9"},
]


def compare_col_arrays(list_a, list_b):
    missing = []
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
            print(f"{key} is missing")
            missing.append(col)
            continue
        # see if the column type is the same
        a_col_type = col["dataTypeName"]
        b_col_type = matching_col["dataTypeName"]
        if a_col_type != b_col_type:
            print(f"{key} is type {a_col_type} vs {b_col_type}")


def main():
    socrata_client = get_socrata_client()
    for dataset in datasets:
        cols_staging = socrata_client.get_metadata(dataset["staging"])["columns"]
        cols_prod = socrata_client.get_metadata(dataset["prod"])["columns"]
        print("\n\n**** Comparing staging columns against prod ****")
        compare_col_arrays(cols_staging, cols_prod)
        print("\n\n**** Comparing prod columns against staging ****")
        compare_col_arrays(cols_prod, cols_staging)


if __name__ == "__main__":
    main()
