import os

ATD_CRIS_DATABASE_CONFIG = {
    "host": os.getenv("ATD_KNACK_POSTGRES_HOST"),
    "port": 5432,
    "user": os.getenv("ATD_KNACK_POSTGRES_USER"),
    "pass": os.getenv("ATD_KNACK_POSTGRES_PASS"),
    "sslmode": "require",
    "sslrootcert": os.getenv("ATD_KNACK_POSTGRES_CERT"),
    "database": os.getenv("ATD_KNACK_POSTGRES_DB")
}

ATD_CRIS_DATABASE_TABLES = {
    'crashes': os.getenv("ATD_CRIS_PROSTGRES_TABLE_CRASHES"),
    'charges': os.getenv("ATD_CRIS_PROSTGRES_TABLE_CHARGES"),
    'primaryperson': os.getenv("ATD_CRIS_PROSTGRES_TABLE_PEOPLE"),
    'units': os.getenv("ATD_CRIS_PROSTGRES_TABLE_UNITS")
}

ATD_CRIS_KNACK_DATA_APP = {
    "tables": {
        "crash": "object_1",
        "primaryperson": "object_4",
        "unit": "object_2",
        "charges": "object_xx"
    },
    "unique_field_id": {
        "crash": "field_1",
        "primaryperson": "field_288",
        "unit": "field_254",
        "charges": "object_xx"
    },
    "app_id": os.getenv("ATD_KNACK_APP_ID"),
    "api_key": os.getenv("ATD_KNACK_API_KEY")
}

AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")