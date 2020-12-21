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
    # AWS
    "AWS_DEFALUT_REGION": os.getenv("AWS_DEFALUT_REGION", ""),
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID", ""),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY", ""),

    # HASURA
    "HASURA_ENDPOINT": os.getenv("HASURA_ENDPOINT", ""),
    "HASURA_ADMIN_KEY": os.getenv("HASURA_ADMIN_KEY", ""),
    "MAX_THREADS": int(os.getenv("MAX_THREADS", "20")),
    "MAX_ATTEMPTS": int(os.getenv("MAX_ATTEMPTS", "5")),
    "RETRY_WAIT_TIME": int(os.getenv("RETRY_WAIT_TIME", "5")),
    "HASURA_FORCE_UPSERT": os.getenv("HASURA_FORCE_UPSERT", "DISABLED") == "ENABLED",

    # CRIS
    "ATD_CRIS_WEBSITE": "https://cris.dot.state.tx.us/",
    "ATD_CRIS_USERNAME_CR3": os.getenv("ATD_CRIS_USERNAME", ""),
    "ATD_CRIS_PASSWORD_CR3": os.getenv("ATD_CRIS_PASSWORD", ""),
    "ATD_CRIS_CR3_DOWNLOADS_PER_RUN": os.getenv("ATD_CRIS_DOWNLOADS_PER_RUN", "25"),
    "ATD_CRIS_IMPORT_CSV_BUCKET": os.getenv("ATD_CRIS_IMPORT_CSV_BUCKET", ""),
    "ATD_CRIS_IMPORT_COMPARE_FUNCTION": os.getenv("ATD_CRIS_IMPORT_COMPARE_FUNCTION", "DISABLED"),

    # HERE
    "ATD_HERE_API_ENDPOINT": "https://geocoder.api.here.com/6.2/geocode.json",
    "ATD_HERE_APP_ID": os.getenv("ATD_HERE_APP_ID", ""),
    "ATD_HERE_APP_CODE": os.getenv("ATD_HERE_APP_CODE", ""),
    "ATD_HERE_RECORDS_PER_RUN": os.getenv("ATD_HERE_RECORDS_PER_RUN", "500"),
    "ATD_HERE_BOUNDING_BOX": "30.7113,-98.1464;30.0146,-97.1988",

    # SOCRATA
    "SOCRATA_KEY_ID": os.getenv("SOCRATA_KEY_ID", ""),
    "SOCRATA_KEY_SECRET": os.getenv("SOCRATA_KEY_SECRET", ""),
    "SOCRATA_APP_TOKEN": os.getenv("SOCRATA_APP_TOKEN", ""),
    "SOCRATA_DATASET_CRASHES": os.getenv("SOCRATA_DATASET_CRASHES", ""),
    "SOCRATA_DATASET_PERSONS": os.getenv("SOCRATA_DATASET_PERSONS", ""),

    # CR3
    "ATD_CRIS_CR3_URL": "https://cris.dot.state.tx.us/secure/ImageServices/DisplayImageServlet?target=",
    "AWS_CRIS_CR3_DOWNLOAD_PATH": os.getenv("AWS_CRIS_CR3_DOWNLOAD_PATH", "/app/tmp"),
    "AWS_CRIS_CR3_BUCKET_NAME": os.getenv("AWS_CRIS_CR3_BUCKET_NAME", ""),
    "AWS_CRIS_CR3_BUCKET_PATH": os.getenv("AWS_CRIS_CR3_BUCKET_PATH", "production/cris-cr3-files-unassigned"),

    # REQUEST
    "ATD_CRIS_REQUEST_USERNAME": os.getenv("ATD_CRIS_REQUEST_USERNAME", ""),
    "ATD_CRIS_REQUEST_PASSWORD": os.getenv("ATD_CRIS_REQUEST_PASSWORD", ""),
    "AWS_CRIS_REQUEST_BUCKET_NAME": os.getenv("AWS_CRIS_REQUEST_BUCKET_NAME", ""),
    "AWS_CRIS_REQUEST_BUCKET_PATH": os.getenv("AWS_CRIS_REQUEST_BUCKET_PATH", "txdot-email-pending/"),
    "ATD_CRIS_REQUEST_WEBSITE_HOME": "https://cris.dot.state.tx.us/secure/Share/app/home/welcome",
    # Old Link URL Pattern, use just in case it reverts:
    # "ATD_CRIS_REQUEST_DOWNLOAD_LINK_PATTERN": "(https%3A%2F%2Fcris.dot.state.tx.us%2Fsecure%2FShare%2Fapp%2Fextract-download%2F)([A-Z0-9]+)",
    # New URL Pattern (not url-encoded):
    "ATD_CRIS_REQUEST_DOWNLOAD_LINK_PATTERN": "(https://cris.dot.state.tx.us/secure/Share/app/extract-download/)([A-Z0-9]+)",
    "ATD_CRIS_REQUEST_RETRIEVE_URL_ENDPOINT": "https://cris.dot.state.tx.us/secure/Share/rest/retrievedownload?token=",
}
