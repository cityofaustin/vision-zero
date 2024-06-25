import requests
import os
import subprocess

from exceptions import HasuraAPIError

ENV = os.environ["ENV"]
BUCKET_NAME = os.environ["BUCKET_NAME"]
EXTRACT_PASSWORD = os.environ["EXTRACT_PASSWORD"]


def format_megabytes(bytes):
    return f"{round(bytes/1000000)}mb"


def get_extracts_todo(s3_client, current_stage):
    """
    Fetch a list CRIS extract zips that are in the specified stage: new or pdfs_todo.

    Returns a sorted list of s3 object metadata as { key, size }
    """
    prefix = f"{ENV}/cris_extracts/{current_stage}"
    print(f"Getting list of extracts in {prefix}")
    response = s3_client.list_objects(
        Bucket=BUCKET_NAME,
        Prefix=prefix,
    )
    todos = []
    for item in response.get("Contents", []):
        key = item.get("Key")
        if key.endswith(".zip"):
            todos.append({"file_key": key, "file_size": item.get("Size")})
    # assumes extract ids are sortable news -> oldest - todo: confirm
    return sorted(todos, key=lambda d: d["file_key"])


def download_and_unzip_extract(s3_client, temp_dir_name, file_key, file_size):
    """
    Download zip file and extract into the temp directory
    """
    extract_filename = os.path.basename(file_key)
    zip_extract_local_path = os.path.join(temp_dir_name, extract_filename)
    print(f"Downloading {file_key} ({format_megabytes(file_size)})")
    s3_client.download_file(BUCKET_NAME, file_key, zip_extract_local_path)
    print(f"Unzipping {zip_extract_local_path}")
    unzip_command = (
        f'7za -y -p{EXTRACT_PASSWORD} -o{temp_dir_name} x "{zip_extract_local_path}"'
    )
    subprocess.run(unzip_command, check=True, shell=True, stdout=subprocess.DEVNULL)


def move_zip_to_next_stage(s3_client, s3_resource, file_key, current_stage):
    """Move an extract zip from the current subdirectory 'stage' to the next

    If the zip was in `new`, move to `pdfs_todo`. If the zip was in `pdfs_todo`,
    move to `archive`.
    """
    next_stage = "pdfs_todo" if current_stage == "new" else "archive"
    new_key = file_key.replace(current_stage, next_stage)
    print(f"Copying zip to {BUCKET_NAME}/{new_key}")
    s3_resource.meta.client.copy(
        {"Bucket": BUCKET_NAME, "Key": file_key}, BUCKET_NAME, new_key
    )
    print(f"Deleting zip from {BUCKET_NAME}/{file_key}")
    s3_client.delete_object(Bucket=BUCKET_NAME, Key=file_key)


def make_hasura_request(*, query, endpoint, variables=None):
    payload = {"query": query, "variables": variables}
    res = requests.post(endpoint, json=payload)
    res.raise_for_status()
    data = res.json()
    try:
        return data["data"]
    except KeyError as err:
        raise HasuraAPIError(data) from err
