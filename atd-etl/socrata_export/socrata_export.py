#!/usr/bin/env python
import os

from utils.graphql import make_hasura_request
from utils.logging import init_logger
from utils.queries import QUERIES
from utils.socrata import get_socrata_client

SOCRATA_DATASET_CRASHES = os.getenv("SOCRATA_DATASET_CRASHES")  # staging: 3aut-fhzp
SOCRATA_DATASET_PEOPLE = os.getenv("SOCRATA_DATASET_PEOPLE")  # staging: v3x4-fjgm

# number of records to download from Hasura and upload to Socrata
RECORD_BATCH_SIZE = 100
# number of times to try a single socrata upload
MAX_UPLOAD_RETRIES = 3

datasets = [
    {
        "name": "crashes",
        "typename": "socrata_export_crashes_view",
        "dataset_id": SOCRATA_DATASET_CRASHES,
        "query": QUERIES["crashes"],
    },
    {
        "name": "people",
        "typename": "socrata_export_people_view",
        "dataset_id": SOCRATA_DATASET_PEOPLE,
        "query": QUERIES["people"],
    },
]

# staging
# https://datahub.austintexas.gov/resource/3aut-fhzp.json?$limit=10
# https://datahub.austintexas.gov/resource/v3x4-fjgm.json?$limit=10


def main():
    socrata_client = get_socrata_client()

    for dataset in datasets:
        logger.info(f"Processing {dataset['name']}")
        offset = 0
        records_processed = 0
        while True:
            variables = {"limit": RECORD_BATCH_SIZE, "offset": offset}

            logger.info(f"Fetching up to {RECORD_BATCH_SIZE} records - offset={offset}")
            records = make_hasura_request(query=dataset["query"], variables=variables)[
                dataset["typename"]
            ]

            if offset == 0:
                if not records:
                    raise Exception(
                        "No records returned from Hasura. This should never happen"
                    )
                # we have some records, so it's safe to truncate the Socrata dataset
                logger.info(f"Truncating dataset {dataset['dataset_id']}")
                # socrata_client.replace(dataset["dastaset_id"], [])

            logger.info(f"Upserting {len(records)} records")

            upload_error_count = 0
            while True:
                # try to upload to socrata until max retries is exceeded - then raise an erro
                try:
                    # socrata_client.upsert(dataset["dataset_id"], records)
                    print("hey")
                except Exception as e:
                    upload_error_count += 1
                    if upload_error_count < MAX_UPLOAD_RETRIES:
                        logger.error(f"Error uploading to Socrata: {e}. Retrying...")
                        continue
                    else:
                        logger.error(f"Max Socrata upload retries exceeded")
                        raise e
                # success - break loop
                break

            records_processed += len(records)

            if len(records) < RECORD_BATCH_SIZE:
                logger.info(f"{records_processed} {dataset['name']} records processed")
                break

            offset += RECORD_BATCH_SIZE

    return


if __name__ == "__main__":
    logger = init_logger()
    main()
