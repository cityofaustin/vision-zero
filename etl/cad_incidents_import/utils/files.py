import os

from boto3 import client, resource

BUCKET_NAME = os.getenv("BUCKET_NAME")
BUCKET_ENV = os.getenv("BUCKET_ENV")

s3_client = client("s3")
s3_resource = resource("s3")


def is_file_to_process(filename):
    """
    Check if the file name matches our naming convention
    - TPWCADTrafficSafetyWithGroupIDDaily_20260410.CSV
    - TPWCADTrafficSafetyDaily_20260410.CSV
    """
    return (
        filename.lower().endswith(".csv")
        # and (
        #     "TPWCADTrafficSafetyWithGroupIDDaily" in filename
        #     or "TPWCADTrafficSafetyDaily" in filename
        # )
        and len(filename.split("_")) == 2
    )


def extract_sort_key(object_key_or_full_filename: str) -> tuple[str, int]:
    """Extract the sort key from an object key, ensuring that files are sorted
    by date, then by `WithGroupID` files last.

    We expect object keys like:
        - some/path/TPWCADTrafficSafetyWithGroupIDDaily_20260410.CSV
        - some/path/TPWCADTrafficSafetyDaily_20260410.CSV

    Sort order:
        1. By date ascending (oldest first)
        2. Non-WithGroupID file before WithGroupIDDaily file for the same date
    """
    filename = os.path.basename(object_key_or_full_filename)
    full_name, _ext = filename.split(".")
    name, dt = full_name.split("_")
    # 0 sorts before 1, so the plain "Daily" file comes first
    group_order = 1 if "WithGroupID" in name else 0
    return (dt, group_order)


def get_local_files_to_process(*, dir_name):
    """Returns a sorted list of CAD CSV files to process from the local dir_name

    Args:
        dir_name (str): the name of the directory to look for files

    Returns:
        list: file paths sorted by date, then by `WithGroupID` files last
    """
    files = [
        os.path.join(dir_name, filename)
        for filename in os.listdir(dir_name)
        if is_file_to_process(filename)
    ]

    files.sort(key=extract_sort_key)
    return files


def read_file_local(file_path):
    """Read a file from the local filesystem"""
    with open(file_path, "rb") as f:
        raw = f.read()
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        return raw.decode("cp1252")


def get_s3_files_todo(subdir="inbox"):
    """Get a list of S3 object keys of files to process in the /inbox.

    Args:
        subdir (str, optional): The S3 bucket subdirectory to check. Defaults to "inbox".

    Raises:
        IOError: If no objects are found in the bucket subdirectory

    Returns:
        List: List of S3 object keys, sorted oldest to newest
    """
    prefix = f"{BUCKET_ENV}/cad_incidents/{subdir}"
    response = s3_client.list_objects(
        Bucket=BUCKET_NAME,
        Prefix=prefix,
    )
    files = []
    for item in response.get("Contents", []):
        key = item.get("Key")
        # ignore the subdirectory itself
        if not key.endswith("/"):
            files.append(key)
    if not len(files):
        raise IOError("No files found in S3 bucket")
    files.sort(key=extract_sort_key)
    return files


def download_file_s3(file_obj_key):
    """Download an email message from S3"""
    file_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=file_obj_key)
    raw = file_obj["Body"].read()
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        return raw.decode("cp1252")


def archive_file_s3(file_obj_key):
    """Move file in S3 from  ./inbox to ./archive

    Args:
        email_obj_key (str): the s3 object file key of the email file to be archved
    """
    new_key = file_obj_key.replace("inbox", "archive")

    s3_resource.meta.client.copy(
        {"Bucket": BUCKET_NAME, "Key": file_obj_key}, BUCKET_NAME, new_key
    )
    s3_client.delete_object(Bucket=BUCKET_NAME, Key=file_obj_key)
