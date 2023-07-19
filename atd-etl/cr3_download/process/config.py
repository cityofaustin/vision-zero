"""
ETL Configuration File
Author: Austin Transportation Department, Data and Technology Services

Description: This file contains an dictionary that contains environment
variables for the CR3 download scripts. These
environment variables are fed through Docker. Please refer to the project
readme for further details on how to import environment variables.
"""

import os

ATD_ETL_CONFIG = {
    # AWS
    "AWS_DEFAULT_REGION": os.getenv("AWS_DEFAULT_REGION", ""),
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID", ""),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY", ""),
    # HASURA
    "HASURA_ENDPOINT": os.getenv("HASURA_ENDPOINT", ""),
    "HASURA_ADMIN_KEY": os.getenv("HASURA_ADMIN_KEY", ""),
    "MAX_THREADS": int(os.getenv("MAX_THREADS", "20")),
    "MAX_ATTEMPTS": int(os.getenv("MAX_ATTEMPTS", "5")),
    "RETRY_WAIT_TIME": int(os.getenv("RETRY_WAIT_TIME", "5")),
    # CRIS
    "ATD_CRIS_CR3_DOWNLOADS_PER_RUN": os.getenv("ATD_CRIS_DOWNLOADS_PER_RUN", "25"),
    "CRIS_CR3_DOWNLOAD_COOKIE": os.getenv("CRIS_CR3_DOWNLOAD_COOKIE", ""),
    # CR3
    "ATD_CRIS_CR3_URL": "https://cris.dot.state.tx.us/secure/ImageServices/DisplayImageServlet?target=",
    "AWS_CRIS_CR3_DOWNLOAD_PATH": os.getenv("AWS_CRIS_CR3_DOWNLOAD_PATH", "/app/tmp"),
    "AWS_CRIS_CR3_BUCKET_NAME": os.getenv("AWS_CRIS_CR3_BUCKET_NAME", ""),
    "AWS_CRIS_CR3_BUCKET_PATH": os.getenv(
        "AWS_CRIS_CR3_BUCKET_PATH", "production/cris-cr3-files-unassigned"
    ),
}
