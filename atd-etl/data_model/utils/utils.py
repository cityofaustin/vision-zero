import os
import subprocess

import requests

from utils.exceptions import HasuraAPIError
from utils.settings import LOCAL_EXTRACTS_DIR

ENV = os.environ["ENV"]
BUCKET_NAME = os.environ["BUCKET_NAME"]
EXTRACT_PASSWORD = os.environ["EXTRACT_PASSWORD"]


def format_megabytes(bytes):
    return f"{round(bytes/1000000)}mb"


# def are_unzipped_csvs_available(local_extracts_dir):
#     """Check if there are unzippzed extract files available"""
#     extract_subdirs = []
#     for subdirname in os.listdir(local_extracts_dir):
#         if os.path.isdir(os.path.join(local_extracts_dir, subdirname)):
#             csvs = [
#                 f
#                 for f in os.listdir(os.path.join(local_extracts_dir, subdirname))
#                 if f.endswith(".csv")
#             ]
#             print("found some!")
#             breakpoint()


def get_extact_name_from_file_name(file_key):
    return os.path.basename(file_key).replace(".zip", "")


def get_unzipped_extracts_local(local_extracts_dir):
    unzipped_extracts = []
    for extract_name in os.listdir(local_extracts_dir):
        extract_subdir_full_path = os.path.join(local_extracts_dir, extract_name)
        if os.path.isdir(extract_subdir_full_path):
            csvs = [
                f for f in os.listdir(extract_subdir_full_path) if f.endswith(".csv")
            ]
            if csvs:
                unzipped_extracts.append(
                    {
                        "extract_name": extract_name,
                        "extract_dest_dir": extract_subdir_full_path,
                    }
                )
    return sorted(unzipped_extracts, key=lambda d: d["extract_name"])


def get_extract_zips_todo_local(local_extracts_dir):
    """
    Get a list of zips in <local_extracts_dir>

    Returns a sorted list of dicts as { s3_file_key, local_zip_file_path, file_size, extract_name }
    """
    extracts = []
    for fname in os.listdir(local_extracts_dir):
        if fname.endswith(".zip"):
            zip_extract_local_path = os.path.join(local_extracts_dir, fname)
            zip_size = os.path.getsize(zip_extract_local_path)
            # we're matching the structure of the dict returned from get_extract_zips_to_download_s3
            extracts.append(
                {
                    "s3_file_key": None,
                    "local_zip_file_path": zip_extract_local_path,
                    "file_size": zip_size,
                    "extract_name": get_extact_name_from_file_name(fname),
                }
            )
    return sorted(extracts, key=lambda d: d["extract_name"])


def get_extract_zips_to_download_s3(s3_client, current_stage, local_extracts_dir):
    """
    Fetch a list of CRIS extract zips that are in the specified stage: new or pdfs_todo.

    Returns a sorted list of dicts as { s3_file_key, local_zip_file_path, file_size, extract_name }
    """
    prefix = f"{ENV}/cris_extracts/{current_stage}"
    print(f"Getting list of extracts in {prefix}")
    response = s3_client.list_objects(
        Bucket=BUCKET_NAME,
        Prefix=prefix,
    )
    extracts = []
    for item in response.get("Contents", []):
        key = item.get("Key")
        if key.endswith(".zip"):
            extracts.append(
                {
                    "s3_file_key": key,
                    "local_zip_file_path": os.path.join(
                        local_extracts_dir, os.path.basename(key)
                    ),
                    "file_size": item.get("Size"),
                    "extract_name": get_extact_name_from_file_name(key),
                }
            )
    # assumes extract ids are sortable news -> oldest - todo: confirm
    return sorted(extracts, key=lambda d: d["extract_name"])


def download_extract_from_s3(s3_client, s3_file_key, file_size, local_zip_file_path):
    """
    Download zip file from s3 and return local path to the file
    """
    print(f"Downloading {s3_file_key} ({format_megabytes(file_size)})")
    s3_client.download_file(BUCKET_NAME, s3_file_key, local_zip_file_path)


def unzip_extract(file_path, out_dir_name, file_filter=None):
    """
    Unzip a cris extract
    """
    print(f"Unzipping {file_path} to {out_dir_name}")
    file_filter_arg = f"-i{file_filter}" if file_filter else ""
    unzip_command = f'7za -y -p{EXTRACT_PASSWORD} -o{out_dir_name} {file_filter_arg} x "{file_path}"'
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
