import os
import datetime
from process_config import *

def generate_timestamp():
    """
    Generates a timestamp string to be used for a file name using the format `{}_{}_{}__{}_{}_{}`
    with the current year, month, day, hour, minute and second.
    :return: string
    """
    now = datetime.datetime.now()
    return "{}_{}_{}__{}_{}_{}".format(now.year, now.month, now.day, now.hour, now.minute, now.second)


def get_type(filepath):
    """
    Retrieves the type of record based on the file name of the csv file.
    :param filepath: string The physical path to the file.
    :return:
    """
    return os.path.basename(filepath).split(".")[0]

def upload_to_s3(filepath):
    """
    Generates an aws-cli command to upload a file to s3, then executes that command. It needs the physical
    location of the file.
    :param filepath: string The physical file path
    :return:
    """
    folder = get_type(filepath)
    timestamp = generate_timestamp()
    dest_filename = "{}-{}.csv".format(folder, timestamp)
    destination = "s3://{}/archive/{}/{}".format(AWS_BUCKET_NAME, folder, dest_filename)
    cmd = "aws s3 cp {} {}".format(filepath, destination)
    print("Uploading to S3: " + cmd)
    os.system(cmd)

def cleanup_file(filepath):
    """
    Deletes a file.
    :param filepath: string The file path
    :return:
    """
    print("Cleaning up file (deleting): " + filepath)
    os.remove(filepath)