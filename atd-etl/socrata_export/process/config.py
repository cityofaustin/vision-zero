"""
ETL Configuration File
Author: Austin Transportation Department, Data and Technology Services

Description: This file contains an dictionary that contains environment
variables for all scripts, including CRIS, Hasura, Socrata, ETC. These
environment variables are fed through Docker. Please refer to the project
readme for further details on how to import environment variables.
"""

import os

# AWS Bucket
ATD_ETL_CONFIG = {
    # HASURA
    "HASURA_ENDPOINT": os.getenv("HASURA_ENDPOINT", ""),
    "HASURA_ADMIN_KEY": os.getenv("HASURA_ADMIN_KEY", ""),
    # SOCRATA
    "SOCRATA_KEY_ID": os.getenv("SOCRATA_KEY_ID", ""),
    "SOCRATA_KEY_SECRET": os.getenv("SOCRATA_KEY_SECRET", ""),
    "SOCRATA_APP_TOKEN": os.getenv("SOCRATA_APP_TOKEN", ""),
    "SOCRATA_DATASET_CRASHES": os.getenv("SOCRATA_DATASET_CRASHES", ""),
    "SOCRATA_DATASET_PERSONS": os.getenv("SOCRATA_DATASET_PERSONS", ""),
}
