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

    # CRIS
    "ATD_CRIS_WEBSITE": "https://cris.dot.state.tx.us/",
    "ATD_CRIS_USERNAME_CR3": os.getenv("ATD_CRIS_USERNAME", ""),
    "ATD_CRIS_PASSWORD_CR3": os.getenv("ATD_CRIS_PASSWORD", ""),
    "ATD_CRIS_CR3_DOWNLOADS_PER_RUN": os.getenv("ATD_CRIS_DOWNLOADS_PER_RUN", "25"),

    # HERE
    "ATD_HERE_API_ENDPOINT": "https://geocoder.api.here.com/6.2/geocode.json",

    # SOCRATA
    "SOCRATA_KEY_ID": os.getenv("SOCRATA_KEY_ID", ""),
    "SOCRATA_KEY_SECRET": os.getenv("SOCRATA_KEY_SECRET", ""),
    "SOCRATA_APP_TOKEN": os.getenv("SOCRATA_APP_TOKEN", ""),

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
    "ATD_CRIS_REQUEST_DOWNLOAD_LINK_PATTERN": "(https://cris.dot.state.tx.us/secure/Share/app/home/download\?token\=)([A-Z0-9]+)",
    "ATD_CRIS_REQUEST_RETRIEVE_URL_ENDPOINT": "https://cris.dot.state.tx.us/secure/Share/rest/retrievedownload?token=",
}


