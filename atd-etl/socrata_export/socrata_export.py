#!/usr/bin/env python
import os

from utils.cli import get_cli_args
from utils.graphql import make_hasura_request
from utils.logging import init_logger
from utils.queries import QUERIES
from utils.socrata import get_socrata_client

from requests.exceptions import HTTPError

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


def should_process_dataset(args, dataset_name):
    """Determine to see if the given dataset should be processed based on CLI args"""
    if (not args.crashes and not args.people) or (args.crashes and args.people):
        # no dataset or both dataset names were included in cli args
        return True
    # check to see if the dataset name in the CLI args
    args_dict = vars(args)
    return args_dict.get(dataset_name)


def main(args):
    socrata_client = get_socrata_client()

    for dataset in datasets:
        dataset_name = dataset["name"]
        if not should_process_dataset(args, dataset_name):
            continue

        logger.info(f"Processing {dataset_name}")
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
                socrata_client.replace(dataset["dataset_id"], [])

            logger.info(f"Upserting {len(records)} records")

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

            if len(records) < RECORD_BATCH_SIZE:
                logger.info(f"{records_processed} {dataset_name} records processed")
                break

            offset += RECORD_BATCH_SIZE

    return


if __name__ == "__main__":
    args = get_cli_args()
    logger = init_logger()
    main(args)
