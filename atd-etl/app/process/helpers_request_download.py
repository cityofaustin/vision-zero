"""
CRIS - Request Download Helper
Author: Austin Transportation Department, Data and Technology Services

Description: The purpose of this script is to provide helper functions
that can list and download emails from S3, moving files within the S3
to other folders, parsing emails, downloading the files from a link
within the emails, and extracting the downloaded files.

The application requires:
    https://pypi.org/project/requests/
    https://pypi.org/project/boto3/
    https://pypi.org/project/mail-parser/
"""
import subprocess
import glob
import ntpath
import re

#
# Libraries
#
import requests
import mailparser
import boto3

from .config import ATD_ETL_CONFIG

#
# Initialize some configuration variables
#
AWS_CRIS_REQUEST_BUCKET_NAME = ATD_ETL_CONFIG["AWS_CRIS_REQUEST_BUCKET_NAME"]
AWS_CRIS_REQUEST_BUCKET_PATH = ATD_ETL_CONFIG["AWS_CRIS_REQUEST_BUCKET_PATH"]
AWS_CRIS_REQUEST_DOWNLOAD_LINK_PATTERN = ATD_ETL_CONFIG["ATD_CRIS_REQUEST_DOWNLOAD_LINK_PATTERN"]
ATD_CRIS_REQUEST_RETRIEVE_URL_ENDPOINT = ATD_ETL_CONFIG["ATD_CRIS_REQUEST_RETRIEVE_URL_ENDPOINT"]

#
# Let's initialize our client object
#
aws_s3_client = boto3.client('s3', aws_access_key_id=ATD_ETL_CONFIG["AWS_ACCESS_KEY_ID"],
                            aws_secret_access_key=ATD_ETL_CONFIG["AWS_SECRET_ACCESS_KEY"])


def aws_list_files():
    """
    Returns a list of email files.
    :return: object
    """
    global aws_s3_client
    response = aws_s3_client.list_objects(Bucket=AWS_CRIS_REQUEST_BUCKET_NAME,
                                   Prefix=AWS_CRIS_REQUEST_BUCKET_PATH)

    for content in response.get('Contents', []):
        yield content.get('Key')


def get_email_list():
    """
    Returns an array of files parsed into an actual array (as opposed to an object)
    :return: array of strings
    """
    email_file_list = []
    pending_email_list = aws_list_files()
    for email_file in pending_email_list:
        email_file_list.append(email_file)

    # Remove the first item, it is not needed
    # since it is just the name of the folder
    email_file_list.pop(0)

    # Finally return the final list
    return email_file_list


def get_file_name(file_key):
    """
    Returns the name of an email file based on the full s3 file path
    :param file_key: the file path
    :return: string
    """
    return "email_" + ntpath.basename(file_key)


def download_s3_file(file_key):
    """
    Downloads an email file from s3
    :param file_key: the full path to the email file
    :return:
    """
    with open("/app/tmp/%s" % (get_file_name(file_key)), 'wb') as f:
        aws_s3_client.download_fileobj(AWS_CRIS_REQUEST_BUCKET_NAME, file_key, f)


def parse_email(file_key):
    return mailparser.parse_from_file("/app/tmp/%s" % (get_file_name(file_key)))


def extract_email_download_link(email_body):
    """
    Returns the download url from an email text body.
    :param email_body: full raw body from the file
    :return: string
    """
    download_link_string = re.search(AWS_CRIS_REQUEST_DOWNLOAD_LINK_PATTERN, email_body, re.IGNORECASE)
    if download_link_string:
        url = download_link_string.group(1).replace("%2F", "/").replace("%3A", ":") + download_link_string.group(2)
        token = download_link_string.group(2)
        return url, token
    else:
        return None, None


def request_zip_file_url(cris_download_token, cookies):
    """
    Retrieves the final zip file url from CRIS's API
    :param cris_download_token: string - The token as provided by the email url
    :param cookies: dictionary - the browser's cookies
    :return: string
    """
    # Generate the api url based on the config's endpoint and token
    http_request_url = ATD_CRIS_REQUEST_RETRIEVE_URL_ENDPOINT + cris_download_token

    # Form headers for http request
    http_request_headers = {
       'accept': 'application/json, text/plain, */*'
    }

    # Make HTTP response
    http_request_response = requests.get(http_request_url,
                                         headers=http_request_headers,
                                         allow_redirects=True,
                                         cookies=cookies)

    # Try parsing the Json response, look for the downloadExtractUrl key
    try:
        zip_file_url = ATD_ETL_CONFIG["ATD_CRIS_WEBSITE"][:-1] + \
                       http_request_response.json()["downloadExtractUrl"]
    except Exception as e:
        # show an error
        zip_file_url = "error: %s" % str(e)
        print(zip_file_url)

    # Return URL or error message
    return zip_file_url


def cris_download_zip_file(file_url, cookies):
    """
    Download the actual ZIP file
    :param file_url: string - the api-provided url of the zip
    :param cookies: dictionary - browser cookies
    :return:
    """
    resp = requests.get(file_url, allow_redirects=True, cookies=cookies)
    open("/app/tmp/%s" % ntpath.basename(file_url), 'wb').write(resp.content)


def get_zip_file_list():
    """
    Returns a list of all files to be extracted
    :return: array
    """
    return glob.glob("/app/tmp/*.zip")


def run_command(command):
    """
    Runs a command
    :param command: array of strings containing the command and flags
    """
    print(command)
    print(subprocess.check_output(command, shell=True).decode("utf-8"))


def extract_zip(file):
    """
    Runs a command to extract the 7z files into our /data directory
    :param file: string - the full file path
    :return:
    """
    run_command("7z x %s -aoa -o/data -p$ATD_CRIS_REQUEST_PASSWORD" % file)


def move_email_to_finished(full_file_key):
    """
    Moves an email file in s3 from the pending folder to the finished folder.
    :param full_file_key: string - the full file key
    :return:
    """
    # Copy file into new path
    copy_source = {
        'Bucket': AWS_CRIS_REQUEST_BUCKET_NAME,
        'Key': full_file_key
    }
    aws_s3_client.copy(copy_source, AWS_CRIS_REQUEST_BUCKET_NAME, "txdot-email-finished/%s" % ntpath.basename(full_file_key))

    # Delete the original file
    aws_s3_client.delete_object(
        Bucket=AWS_CRIS_REQUEST_BUCKET_NAME,
        Key=full_file_key
    )
