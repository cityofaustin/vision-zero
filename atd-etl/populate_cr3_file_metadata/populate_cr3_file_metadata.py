#!/usr/bin/env python

import os, json, boto3, datetime, requests
from typing import Optional, Set
from string import Template

PDF_MIME_COMMAND = Template("/usr/bin/file -b --mime $PDF_FILE")
PDF_MAX_RECORDS = os.getenv("PDF_MAX_RECORDS", 100)

AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "")
AWS_BUCKET_ENVIRONMENT = os.getenv("AWS_BUCKET_ENVIRONMENT", "")
AWS_S3_CLIENT = boto3.client("s3")

quit()

def is_crash_id(crash_id: int) -> bool:
    """
    Returns True if it is a valid integer
    :param int crash_id: The id to be tested
    :return bool:
    """
    return str(crash_id).isdigit()


def is_valid_metadata(metadata: dict) -> bool:
    if (
        metadata.get("last_update", None) is not None
        and metadata.get("file_size", None) is not None
        and metadata.get("mime_type", None) is not None
        and metadata.get("encoding", None) is not None
    ):
        return True
    return False


def file_exists(crash_id: int) -> bool:
    """
    Returns True if the file exists, False otherwise
    :param int crash_id:
    :return bool:
    """
    try:
        if is_crash_id(crash_id):
            return os.path.isfile(f"./{crash_id}.pdf")
        else:
            return False
    except:
        return False


def download_file(crash_id: int) -> bool:
    """
    Downloads a CR3 PDF file into disk
    :param int crash_id: The crash id of the record to be downloaded
    :return bool: True if it succeeds, false otherwise.
    """
    try:
        if is_crash_id(crash_id):
            AWS_S3_CLIENT.download_file(
                AWS_BUCKET_NAME,
                f"{AWS_BUCKET_ENVIRONMENT}/cris-cr3-files/{crash_id}.pdf",
                f"{crash_id}.pdf",
            )
            return file_exists(crash_id)
        else:
            return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False


def delete_file(crash_id: int) -> bool:
    """
    Deletes a CR3 PDF file from disk
    :param int crash_id: The crash id of the file to be deleted
    :return bool:
    """
    if is_crash_id(crash_id) and file_exists(crash_id):
        os.remove(f"./{crash_id}.pdf")
        return file_exists(crash_id) is False
    else:
        return False


def get_mime_attributes(crash_id: int) -> dict:
    """
    Runs a shell command and returns a dictionary with mime attributes
    :return dict:
    """
    # Make sure the id is an integer and that the file exists...
    if not is_crash_id(crash_id) or not file_exists(crash_id):
        return {}

    # Execute command to get mime attributes as accurately as possible:
    try:
        command = PDF_MIME_COMMAND.substitute(PDF_FILE=f"./{crash_id}.pdf")
        mime_attr_str = os.popen(command).read()
        mime_attr = mime_attr_str.replace(" charset=", "").strip().split(";", 2)

        return {"mime_type": mime_attr[0], "encoding": mime_attr[1]}
    except IndexError:
        return {}


def get_file_size(crash_id: int) -> int:
    """
    Gets the file size for crash_id
    :param int crash_id: The crash id of the file to be tested
    :return int:
    """
    if not is_crash_id(crash_id) or not file_exists(crash_id):
        return 0

    try:
        return os.path.getsize(f"./{crash_id}.pdf")
    except FileNotFoundError:
        return 0


def get_timestamp() -> str:
    """
    Returns a string containing the date and time the file was tested
    :return str:
    """
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def get_file_metadata(crash_id: int) -> dict:
    """
    Returns a dictionary containing the metadata for a file. It assumes the file already exists in disk.
    :param int crash_id:
    :return dict:
    """

    if not is_crash_id(crash_id) or not file_exists(crash_id):
        return {}

    timestamp = get_timestamp()
    file_size = get_file_size(crash_id)
    mime_attr = get_mime_attributes(crash_id)
    failed_download = is_failed_cris_download(f"./{crash_id}.pdf")

    return {
        "last_update": timestamp,
        "file_size": file_size if not failed_download else 0,
        "mime_type": mime_attr.get("mime_type", None)
        if not failed_download
        else "text/html",
        "encoding": mime_attr.get("encoding", None)
        if not failed_download
        else "us-ascii",
    }


def process_record(crash_id: int) -> bool:
    """
    Controls the process for a single file
    """
    if not is_crash_id(crash_id):
        print(f"Invalid crash_id: {crash_id}")
        return False

    # 1. Download file to disk
    if not download_file(crash_id):
        print(f"Could not find CR3 file for crash_id: {crash_id}")
        return False

    if not file_exists(crash_id):
        print(f"The PDF file for crash_id: {crash_id} does not exist. Skipping.")
        return False

    # 2. Generate file metadata
    metadata = get_file_metadata(crash_id)
    if not is_valid_metadata(metadata):
        print(f"Invalid metadata for file for crash_id: {crash_id}")
        return False

    # 3. Execute GraphQL with new metadata
    update_metadata(crash_id, metadata)

    # 4. Delete the file from disk
    delete_file(crash_id)
    return True


def get_file_metadata_cloud(crash_id: int) -> Optional[dict]:
    """
    Attempts to retrieve the metadata from the database, which can be NULL.
    :param int crash_id: The crash_id to retrieve it from
    :return dict:
    """
    if not is_crash_id(crash_id):
        # If the crash id is not valid, return None
        return None

    # Executes GraphQL to fetch any crashes without CR3 PDF metadata, with a limit as indicated
    query_get_record = """
        query getUnverifiedCr3($crash_id:Int!) {
          atd_txdot_crashes(where: {crash_id: {_eq:$crash_id}}) {
            cr3_file_metadata
          }
        }
    """
    response = requests.post(
        url=os.getenv("HASURA_ENDPOINT"),
        headers={
            "Accept": "*/*",
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_KEY"),
        },
        json={"query": query_get_record, "variables": {"crash_id": int(crash_id)}},
    )
    response.encoding = "utf-8"
    try:
        return response.json()["data"]["atd_txdot_crashes"][0]["cr3_file_metadata"]
    except (IndexError, TypeError, KeyError):
        return None


def get_records(limit: int = 100) -> Set[int]:
    """
    Returns a list of all CR3 crashes without CR3 PDF metadata
    :return Set[int]:
    """
    if not str(limit).isdigit() or limit == 0:
        return set()

    # Executes GraphQL to fetch any crashes without CR3 PDF metadata, with a limit as indicated
    query_get_records = """
        query getUnverifiedCr3($limit:Int!) {
          atd_txdot_crashes(where: {cr3_file_metadata: {_is_null: true}, cr3_stored_flag: {_eq: "Y"}}, limit: $limit, order_by: {crash_id: desc}) {
            crash_id
          }
        }
    """
    response = requests.post(
        url=os.getenv("HASURA_ENDPOINT"),
        headers={
            "Accept": "*/*",
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_KEY"),
        },
        json={"query": query_get_records, "variables": {"limit": int(limit)}},
    )

    try:
        response.encoding = "utf-8"
        records = response.json()

    except Exception as e:
        print("Error: " + str(e))
        records = {"data": {"atd_txdot_crashes": []}}

    try:
        return set(map(lambda x: x["crash_id"], records["data"]["atd_txdot_crashes"]))
    except (KeyError, TypeError):
        print("No data available. Response: ", records)
        return set()


def update_metadata(crash_id: int, metadata: dict) -> bool:
    """
    Returns True if it manages to update the metadata for an object.
    :param int crash_id: The crash id to be updated
    :param dict metadata: The metadata to be set
    :return bool:
    """
    if (
        not is_crash_id(crash_id)
        or not isinstance(metadata, dict)
        or not is_valid_metadata(metadata)
    ):
        return False

    print(f"Updating crash_id: {crash_id}, with metadata: {json.dumps(metadata)}")

    mutation_update_crash_cr3_metadata = """
        mutation updateCrashCr3Metadata($crash_id:Int!, $metadata: jsonb) {
          update_atd_txdot_crashes(
            where: {
                crash_id:{_eq: $crash_id}
            },
            _set: {
                cr3_file_metadata: $metadata
                updated_by: "SYSTEM"
            }
          ){
            affected_rows
          }
        }
    """
    response = requests.post(
        url=os.getenv("HASURA_ENDPOINT"),
        headers={
            "Accept": "*/*",
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_KEY"),
        },
        json={
            "query": mutation_update_crash_cr3_metadata,
            "variables": {"crash_id": int(crash_id), "metadata": metadata},
        },
    )
    response.encoding = "utf-8"
    try:
        return response.json()["data"]["update_atd_txdot_crashes"]["affected_rows"] > 0
    except (KeyError, TypeError):
        return False


def main():
    """
    Main Loop
    """
    # Processes each one of these crashes using process_record function
    for crash_id in get_records(PDF_MAX_RECORDS):
        process_record(crash_id)


if __name__ == "__main__":
    main()
