import argparse
import requests
import pandas as pd

# from secrets import HASURA_AUTH

def read_excel_file():
  df = pd.read_excel('fatalities_list.xlsx', sheet_name="fatality list")
  return df

# def make_hasura_request():


def main(env):
  df = read_excel_file()

  print(df['Case ID'].nunique())

  # for ind in df.index:
  #   print(df['APD Fatality Crash #'].nunique())


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