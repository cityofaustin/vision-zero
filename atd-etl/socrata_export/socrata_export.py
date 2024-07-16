#!/usr/bin/env python
import os

from utils.cli import get_cli_args
from utils.graphql import make_hasura_request
from utils.logging import init_logger
from utils.queries import QUERIES
from utils.socrata import get_socrata_client

SOCRATA_DATASET_CRASHES = os.getenv("SOCRATA_DATASET_CRASHES")
SOCRATA_DATASET_PEOPLE = os.getenv("SOCRATA_DATASET_PEOPLE")

# number of records to download from Hasura and upload to Socrata
RECORD_BATCH_SIZE = 1000
# number of times to try a single socrata upload
MAX_UPLOAD_RETRIES = 1

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


def main(args_dict):
    socrata_client = get_socrata_client()

    for dataset in datasets:
        dataset_name = dataset["name"]
        if not args_dict.get(dataset_name):
            continue

        logger.info(f"Processing {dataset_name}")

        min_id = 0
        records_processed = 0
        while True:
            logger.info(f"Fetching up to {RECORD_BATCH_SIZE} records")
            variables = {"limit": RECORD_BATCH_SIZE, "minId": min_id}
            records = make_hasura_request(query=dataset["query"], variables=variables)[
                dataset["typename"]
            ]

            if min_id == 0:
                if not records:
                    raise Exception(
                        "No records returned from Hasura. This should never happen"
                    )
                # we have some records, so it's safe to truncate the Socrata dataset
                logger.info(f"Truncating dataset {dataset['dataset_id']}")
                socrata_client.replace(dataset["dataset_id"], [])
            elif not records:
                logger.info(f"{records_processed} {dataset_name} records processed")
                break

            logger.info(
                f"Upserting {len(records)} records IDs: {records[0]['id']} - {records[-1]['id']} (total records: {records_processed})"
            )

            upload_error_count = 0
            while True:
                # try to upload to socrata until max retries is exceeded - then raise an error
                try:
                    socrata_client.upsert(dataset["dataset_id"], records)
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
            min_id = records[-1]["id"] + 1
    return


if __name__ == "__main__":
    args = get_cli_args()
    logger = init_logger()
    if not args.crashes and not args.people:
        raise ValueError("No dataset(s) specify. At least one of '--crashes' or '--people' is required")
    args_dict = vars(args)
    main(args_dict)
