#!/usr/bin/env python
import os

from utils.graphql import create_log_entry, set_log_entry_complete
from utils.logging import init_logger


HASURA_ENDPOINT = os.getenv("HASURA_ENDPOINT")
HASURA_ADMIN_KEY = os.getenv("HASURA_ADMIN_KEY")
SOCRATA_KEY_ID = os.getenv("SOCRATA_KEY_ID")
SOCRATA_KEY_SECRET = os.getenv("SOCRATA_KEY_SECRET")
SOCRATA_APP_TOKEN = os.getenv("SOCRATA_APP_TOKEN")
SOCRATA_DATASET_CRASHES = os.getenv("SOCRATA_DATASET_CRASHES") # staging: 3aut-fhzp
SOCRATA_DATASET_PERSONS = os.getenv("SOCRATA_DATASET_PEOPLE") # staging: v3x4-fjgm

# staging
# https://datahub.austintexas.gov/resource/3aut-fhzp.json?$limit=10
# https://datahub.austintexas.gov/resource/v3x4-fjgm.json?$limit=10

def main():
    return


if __name__ == "__main__":
    logger = init_logger()
    main()
