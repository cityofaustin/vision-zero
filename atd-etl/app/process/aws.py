"""
AWS Helpers
Author: Austin Transportation Department, Data and Technology Services

Description: The purpose of this script is to provide helper methods
associated to AWS services.
"""
import subprocess
import boto3

# We need our AWS configuration variables
from .config import ATD_ETL_CONFIG


def aws_credentials_present():
    """
    Returns True if the environment variables containing AWS credentials
    are present, returns False otherwise (if either key id, or secret key,
    or default region values are missing).
    :return: boolean - True if the AWS credentials are present.
    """
    return ATD_ETL_CONFIG["AWS_DEFALUT_REGION"] != "" \
           and ATD_ETL_CONFIG["AWS_ACCESS_KEY_ID"] != "" \
           and ATD_ETL_CONFIG["AWS_SECRET_ACCESS_KEY"] != ""


def aws_valid_access():
    """
    Returns true if we have access to aws resources.
    :return: boolean - True if we have access.
    """
    try:
        boto3.Session(
            aws_access_key_id=ATD_ETL_CONFIG["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=ATD_ETL_CONFIG["AWS_SECRET_ACCESS_KEY"]
        )
        return True
    except:
        return False


def run_command(command):
    """
    Runs a shell command, returns output
    :param command:  string
    :return:  string
    """

    return subprocess.run([command], stdout=subprocess.PIPE).stdout.decode("utf-8")


def upload_s3(filename, destination):
    """
    Uploads a file to S3
    :param filename: string - Path to the file to upload to s3
    :param destination: string - Path to the destination folder
    """
    print(run_command("aws s3 cp %s %s" % (filename, destination)))


def cleanup():
    """
    Removes pdf and png files from the temporal folder
    """
    print("Removing PNG screenshots")
    run_command("rm /app/tmp/*.png")
    print("Removing all PDFs")
    run_command("rm /app/tmp/*.pdf")
