#
# Configuration for ETL processes
#
import os

# AWS Bucket
ATD_ETL_CONFIG = {
    "AWS_DOWNLOAD_PATH": "/app/tmp/",
    "AWS_BUCKET": os.getenv("AWS_BUCKET_NAME"),
    "AWS_BUCKET_PATH": os.getenv("AWS_BUCKET_PATH", "production/cris-cr3-files-unassigned"),

    # HASURA
    "HASURA_ENDPOINT": os.getenv("HASURA_ENDPOINT"),
    "HASURA_ADMIN_KEY": os.getenv("HASURA_ADMIN_KEY"),

    # CRIS
    "ATD_CRIS_USERNAME_CR3": os.getenv("ATD_CRIS_USERNAME"),
    "ATD_CRIS_PASSWORD_CR3": os.getenv("ATD_CRIS_PASSWORD"),
    "ATD_CRIS_CR3_DOWNLOADS_PER_RUN": os.getenv("ATD_CRIS_DOWNLOADS_PER_RUN", "25"),

    # CR3
    "ATD_CRIS_WEBSITE": "https://cris.dot.state.tx.us/",
    "ATD_CRIS_CR3_URL": "https://cris.dot.state.tx.us/secure/ImageServices/DisplayImageServlet?target=",

    # REQUEST
    "ATD_CRIS_WEBSITE_HOME": "https://cris.dot.state.tx.us/secure/Share/app/home/welcome",
    "ATD_CRIS_WEBSITE_ENDPOINT":  "https://cris.dot.state.tx.us/secure/Share/rest/saveextractrequest",
    "ATD_CRIS_WEBSITE_REQUEST": {
        "type": "https://cris.dot.state.tx.us/secure/Share/app/home/request/type",
        "location": "https://cris.dot.state.tx.us/secure/Share/app/home/request/location",
        "date":  "https://cris.dot.state.tx.us/secure/Share/app/home/request/date",
        "summary": "https://cris.dot.state.tx.us/secure/Share/app/home/request/summary"
    }
}
