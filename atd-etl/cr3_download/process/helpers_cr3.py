"""
Helpers for CR3 Downloads
Author: Austin Transportation Department, Data and Technology Services

Description: This script contains methods that help in the download
and processing of CR3 files, this can include downloading the file
from a CRIS endpoint, uploading files to S3, etc.

The application requires the requests library:
    https://pypi.org/project/requests/
"""

import os
import requests
import base64
import subprocess
import time
from io import BytesIO
from http.cookies import SimpleCookie
import magic

# We need the run_query method
from .request import run_query


def run_command(command, verbose, log):
    """
    Runs a command
    :param command: array of strings containing the command and flags
    :param verbose: boolean, handles level of logging
    :param log: logger - The logger object
    """
    if verbose:
        log.info(command)
        log.info(subprocess.check_output(command, shell=True).decode("utf-8"))
    else:
        subprocess.check_output(command, shell=True).decode("utf-8")


def download_cr3(crash_id, cookies, verbose, log):
    """
    Downloads a CR3 pdf from the CRIS website.
    :param crash_id: string - The crash id
    :param cookies: dict - A dictionary containing key=value pairs with cookie name and values.
    :param verbose: boolean, handles level of logging
    :param log: logger - The logger object
    """

    cookie = SimpleCookie()
    cookie.load(cookies)
    baked_cookies = {}
    for key, morsel in cookie.items():
        baked_cookies[key] = morsel.value

    crash_id_encoded = base64.b64encode(
        str("CrashId=" + crash_id).encode("utf-8")
    ).decode("utf-8")
    url = os.getenv("ATD_CRIS_CR3_URL") + crash_id_encoded

    log.info("Downloading (%s) from %s" % (crash_id, url))
    resp = requests.get(url, allow_redirects=True, cookies=baked_cookies)

    # Create a BytesIO object and write the content to it
    file_in_memory = BytesIO()
    file_in_memory.write(resp.content)
    file_in_memory.seek(0)  # Reset the file pointer to the beginning

    return file_in_memory


import boto3
from botocore.exceptions import NoCredentialsError


def upload_cr3(crash_id, cr3: BytesIO, verbose, log):
    """
    Uploads a BytesIO object to S3
    :param crash_id: string - The crash id
    :param cr3: BytesIO - The BytesIO object containing the PDF data
    :param verbose: boolean, handles level of logging
    :param log: logger - The logger object
    """
    s3 = boto3.client("s3")

    destination = "%s/%s.pdf" % (
        os.getenv("AWS_CRIS_CR3_BUCKET_PATH"),
        crash_id,
    )

    try:
        s3.upload_fileobj(cr3, os.getenv("AWS_CRIS_CR3_BUCKET_NAME"), destination)
        if verbose:
            log.info(f"File uploaded to {destination}")
    except NoCredentialsError:
        log.error("No AWS credentials found")


def get_crash_id_list():
    """
    Downloads a list of crashes that do not have a CR3 associated.
    :return: dict - Response from request.post
    """
    query_crashes_cr3 = """
        query CrashesWithoutCR3 {
          atd_txdot_crashes(
            where: {
                cr3_stored_flag: {_eq: "N"}
                temp_record: {_eq: false}
            },
            order_by: {crash_date: desc}
          ) {
            crash_id
          }
        }
    """

    return run_query(query_crashes_cr3)


def update_crash_id(crash_id, log):
    """
    Updates the status of a crash to having an available CR3 pdf in the S3 bucket.
    :param crash_id: string - The Crash ID that needs to be updated
    :param log: logger - The logger object
    :return: dict - Response from request.post
    """

    update_record_cr3 = (
        """
        mutation CrashesUpdateRecordCR3 {
          update_atd_txdot_crashes(where: {crash_id: {_eq: %s}}, _set: {cr3_stored_flag: "Y", updated_by: "System"}) {
            affected_rows
          }
        }
    """
        % crash_id
    )
    log.info(f"Marking CR3 status as downloaded for crash_id: {crash_id}")
    return run_query(update_record_cr3)


def check_if_pdf(file_in_memory: BytesIO):
    """
    Checks if a BytesIO object contains a pdf
    :param file_in_memory: BytesIO - The BytesIO object
    :return: boolean - True if the BytesIO object contains a pdf
    """
    mime = magic.Magic(mime=True)
    file_type = mime.from_buffer(file_in_memory.read())
    file_in_memory.seek(0)  # Reset the file pointer to the beginning
    return file_type == "application/pdf"


def process_crash_cr3(crash_record, cookies, skipped_uploads_and_updates, verbose, log):
    """
    Downloads a CR3 pdf, uploads it to s3, updates the database and deletes the pdf.
    :param crash_record: dict - The individual crash record being processed
    :param cookies: dict - The cookies taken from the browser object
    :param skipped_uploads_and_updates: list - Crash IDs of unsuccessful pdf downloads
    :param verbose: boolean, handles level of logging
    :param log: logger - The logger object
    """
    try:
        crash_id = str(crash_record["crash_id"])

        print("Processing Crash: " + crash_id)

        cr3 = download_cr3(crash_id, cookies, verbose, log)
        is_file_pdf = check_if_pdf(cr3)

        if not is_file_pdf:
            log.warning(
                f"\nFile for crash ID {crash_id} is not a pdf - skipping upload and update"
            )
            time.sleep(10)
            skipped_uploads_and_updates.append(crash_id)
        else:
            upload_cr3(crash_id, cr3, verbose, log)
            update_crash_id(crash_id, log)

    except Exception as e:
        log.error("Error: %s" % str(e))
        return
