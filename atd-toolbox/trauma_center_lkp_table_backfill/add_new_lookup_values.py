"""Compares two lookup table exports."""

import argparse
import requests
from datetime import datetime
import pandas as pd

from env import HASURA_AUTH

def parse_csv():
  old_csv = pd.read_csv('old.csv')
  new_csv = pd.read_csv('new.csv')
  return old_csv, new_csv

def main(env):
	counts = 0
	old_csv, new_csv = parse_csv()

	print(new_csv.columns)

	df = pd.merge(new_csv, old_csv, how='outer', suffixes=('','_y'), indicator=True)
	rows_in_new_not_in_old = df[df['_merge']=='left_only'][new_csv.columns]
	lookup_table_additions = rows_in_new_not_in_old.ColumnName.unique()

	df = pd.merge(old_csv, new_csv, how='outer', suffixes=('','_y'), indicator=True)
	rows_in_old_not_in_new = df[df['_merge']=='left_only'][new_csv.columns]
	lookup_table_removals = rows_in_old_not_in_new.ColumnName.unique()

	print(rows_in_new_not_in_old.shape[0], " rows to add in the following lookup tables: ", lookup_table_additions)
	print(rows_in_old_not_in_new.shape[0], " rows to delete in the following lookup tables: ", lookup_table_removals)

	rows_in_new_not_in_old.to_csv('additions.csv', index=False)
	rows_in_old_not_in_new.to_csv('removals.csv', index=False)

if __name__ == "__main__":
  parser = argparse.ArgumentParser()

  parser.add_argument(
    "-e",
    "--env",
    type=str,
    choices=["local", "staging", "prod"],
    default="staging",
    help=f"Environment",
  )

  args = parser.parse_args()

  main(args.env)
  