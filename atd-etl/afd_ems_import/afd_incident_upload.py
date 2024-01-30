#!/usr/bin/env python

"""
Name: AFD Incident Uploads
Description: 
    This script is used to upload AFD incident data to the Vision Zero Database. It's 
    parsed from data stored in an S3 bucket that is populated by an automated email from the
    upstream source of the data.

    The data is emailed to atd-afd-incident-data@austinmobility.io daily ~ 6:30AM. From there it
    gets forwarded to a S3 bucket via AWS Simple Email Service.
Local / development execution:
    docker compose run -it import afd
"""

import datetime
import json
import boto3
import pprint
import os
import time
import email
import tempfile
import shutil
import pandas
from datetime import datetime, timedelta
import psycopg2
import psycopg2.extras
from sshtunnel import SSHTunnelForwarder

import onepasswordconnectsdk
from onepasswordconnectsdk.client import Client, new_client

pp = pprint.PrettyPrinter(indent=4)

DEPLOYMENT_ENVIRONMENT = os.environ.get(
    "ENVIRONMENT", "development"
)  # our current environment from ['production', 'development']
ONEPASSWORD_CONNECT_TOKEN = os.getenv("OP_API_TOKEN")  # our secret to get secrets 🤐
ONEPASSWORD_CONNECT_HOST = os.getenv("OP_CONNECT")  # where we get our secrets
VAULT_ID = os.getenv("OP_VAULT_ID")


def get_secrets():
    REQUIRED_SECRETS = {
        "bastion_host": {
            "opitem": "RDS Bastion Host",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.Host",
            "opvault": VAULT_ID,
        },
        "bastion_ssh_username": {
            "opitem": "RDS Bastion Host",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.ssh Username",
            "opvault": VAULT_ID,
        },
        "database_host": {
            "opitem": "Vision Zero Database",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.Database Host",
            "opvault": VAULT_ID,
        },
        "database_username": {
            "opitem": "Vision Zero Database",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.Database Username",
            "opvault": VAULT_ID,
        },
        "database_password": {
            "opitem": "Vision Zero Database",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.Database Password",
            "opvault": VAULT_ID,
        },
        "database_name": {
            "opitem": "Vision Zero Database",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.Database Name",
            "opvault": VAULT_ID,
        },
        "database_ssl_policy": {
            "opitem": "Vision Zero Database",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.Database SSL Policy",
            "opvault": VAULT_ID,
        },
        "aws_access_key": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AWS Access Key ID",
            "opvault": VAULT_ID,
        },
        "aws_secret_key": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AWS Secret Access Key",
            "opvault": VAULT_ID,
        },
        "source_bucket": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AFD S3 Source Bucket",
            "opvault": VAULT_ID,
        },
        "source_prefix": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AFD S3 Source Prefix",
            "opvault": VAULT_ID,
        },
        "archive_bucket": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AFD S3 Archive Bucket",
            "opvault": VAULT_ID,
        },
        "archive_prefix": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AFD S3 Archive Prefix",
            "opvault": VAULT_ID,
        },
        "bastion_ssh_private_key": {
            "opitem": "RDS Bastion Key",
            "opfield": ".private key",
            "opvault": VAULT_ID,
        },
        "record_age_maximum_in_days": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AFD Record Age Maximum in Days",
            "opvault": VAULT_ID,
        },
    }

    # instantiate a 1Password client
    client: Client = new_client(ONEPASSWORD_CONNECT_HOST, ONEPASSWORD_CONNECT_TOKEN)
    # get the requested secrets from 1Password
    return onepasswordconnectsdk.load_dict(client, REQUIRED_SECRETS)


secrets = get_secrets()

DB_USERNAME = secrets["database_username"]
DB_PASSWORD = secrets["database_password"]
DB_HOSTNAME = secrets["database_host"]
DB_PORT = 5432
DB_DATABASE = secrets["database_name"]
AWS_ACCESS_KEY_ID = secrets["aws_access_key"]
AWS_SECRET_ACCESS_KEY = secrets["aws_secret_key"]
AFD_S3_SOURCE_BUCKET = secrets["source_bucket"]
AFD_S3_ARCHIVE_BUCKET = secrets["archive_bucket"]
AFD_S3_SOURCE_PREFIX = secrets["source_prefix"]
AFD_S3_ARCHIVE_PREFIX = secrets["archive_prefix"]
DB_BASTION_HOST = secrets["bastion_host"]
DB_BASTION_HOST_SSH_USERNAME = secrets["bastion_ssh_username"]
DB_BASTION_HOST_SSH_PRIVATE_KEY = secrets["bastion_ssh_private_key"]
DB_RDS_HOST = secrets["database_host"]
RECORD_AGE_MAXIMUM = secrets["record_age_maximum_in_days"]


def main():
    record_age_maximum = int(RECORD_AGE_MAXIMUM) or 15
    timestamp = get_timestamp()
    newest_email = get_most_recent_email()
    attachment_location = extract_email_attachment(newest_email)
    uploaded_token = upload_attachment_to_S3(attachment_location, timestamp)
    data = create_and_parse_dataframe(attachment_location)
    upload_token = upload_data_to_postgres(data, record_age_maximum)


def get_timestamp():
    current = datetime.now()
    return time.mktime(current.timetuple())


def get_most_recent_email():
    """
    Find the most recently updated file in the bucket. This will be the newest email.
    :return: string
    """

    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
    s3 = session.resource("s3")

    bucket = s3.Bucket(AFD_S3_SOURCE_BUCKET)

    files = []
    for file in bucket.objects.filter(Prefix=AFD_S3_SOURCE_PREFIX):
        files.append(file)
    files.sort(key=lambda x: x.last_modified, reverse=True)

    file = files[0].get()
    email = file["Body"].read().decode("utf-8")

    return email


def extract_email_attachment(message):
    # Given the s3 object content is the SES email,
    # get the message content and attachment using email package
    msg = email.message_from_string(message)
    attachment = msg.get_payload()[1]

    tmpdir = tempfile.mkdtemp()

    print(f"Tmpdir: {tmpdir}")

    # Write the attachment to a temp location
    open(f"{tmpdir}/attachment.xlsx", "wb").write(attachment.get_payload(decode=True))
    return tmpdir


def upload_attachment_to_S3(location, timestamp):
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
    s3 = session.resource("s3")

    s3.Bucket(AFD_S3_ARCHIVE_BUCKET).upload_file(
        f"{location}/attachment.xlsx",
        f"{AFD_S3_ARCHIVE_PREFIX}upload-{timestamp}.xlsx",
    )
    return True


def create_and_parse_dataframe(location):
    # Parse XLSX into pandas dataframe
    data = pandas.read_excel(f"{location}/attachment.xlsx", header=0)
    return data


def upload_data_to_postgres(data, age_cutoff):
    with SshKeyTempDir() as key_directory:
        write_key_to_file(
            key_directory + "/id_ed25519", DB_BASTION_HOST_SSH_PRIVATE_KEY + "\n"
        )
        ssh_tunnel = SSHTunnelForwarder(
            (DB_BASTION_HOST),
            ssh_username=DB_BASTION_HOST_SSH_USERNAME,
            ssh_private_key=f"{key_directory}/id_ed25519",
            remote_bind_address=(DB_RDS_HOST, 5432),
        )
        ssh_tunnel.start()

        pg = psycopg2.connect(
            host="localhost",
            port=ssh_tunnel.local_bind_port,
            user=DB_USERNAME,
            password=DB_PASSWORD,
            dbname=DB_DATABASE,
        )

        print(f"Max record age: {age_cutoff}")
        print(f"Input Dataframe shape: {data.shape}")
        if age_cutoff:
            data["Inc_Date"] = pandas.to_datetime(data["Inc_Date"], format="%Y-%m-%d")
            age_threshold = datetime.today() - timedelta(days=age_cutoff)
            data = data[data["Inc_Date"] > age_threshold]
        print(f"Trimmed data shape: {data.shape}")
        print(data)

        # this emits indices in reverse order, very odd, but not a problem
        for index, row in data.iloc[::-1].iterrows():
            if not index % 100:
                print(f"Row {str(index)} of {str(data.shape[0])}")

            ems_numbers = str(row["EMS_IncidentNumber"]).replace("-", "").split(";")
            if len(ems_numbers) > 1:
                pass

            # Prevent geometry creation error on "-" X/Y value
            longitude = row["X"]
            latitude = row["Y"]
            if row["X"] == "-":
                longitude = None
            if row["Y"] == "-":
                latitude = None

            sql = "select count(id) as existing from afd__incidents where incident_number = %s"

            cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute(sql, (row["Incident_Number"],))
            existing = cursor.fetchone()

            sql = ""
            values = []
            if existing["existing"] > 0:
                print("Updating existing record")
                sql = """
                    update afd__incidents set
                        unparsed_ems_incident_number = %s,
                        ems_incident_numbers = %s,
                        call_datetime = %s,
                        calendar_year = %s,
                        jurisdiction = %s,
                        address= %s,
                        problem = %s,
                        flagged_incs = %s,
                        geometry = ST_SetSRID(ST_MakePoint(%s, %s), 4326)
                    where incident_number = %s
                """

                values = [
                    row["EMS_IncidentNumber"],
                    "{" + ", ".join(ems_numbers) + "}",
                    row["Inc_Date"].strftime("%Y-%m-%d")
                    + " "
                    + row["Inc_Time"].strftime("%H:%M:%S"),
                    row["CalendarYear"],
                    row["Jurisdiction"],
                    row["CAD_Address"],
                    row["CAD_Problem"],
                    row["Flagged_Incs"],
                    longitude,
                    latitude,
                    row["Incident_Number"],
                ]
            else:
                print("Inserting new record")
                sql = """
                    insert into afd__incidents (
                        incident_number, 
                        unparsed_ems_incident_number, 
                        ems_incident_numbers,
                        call_datetime, 
                        calendar_year, 
                        jurisdiction, 
                        address, 
                        problem, 
                        flagged_incs, 
                        geometry
                    ) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326))
                    ON CONFLICT DO NOTHING;
                """

                values = [
                    row["Incident_Number"],
                    row["EMS_IncidentNumber"],
                    "{" + ", ".join(ems_numbers) + "}",
                    row["Inc_Date"].strftime("%Y-%m-%d")
                    + " "
                    + row["Inc_Time"].strftime("%H:%M:%S"),
                    row["CalendarYear"],
                    row["Jurisdiction"],
                    row["CAD_Address"],
                    row["CAD_Problem"],
                    row["Flagged_Incs"],
                    longitude,
                    latitude,
                ]

            try:
                cursor = pg.cursor()
                cursor.execute(sql, values)
                pg.commit()
            except Exception as error:
                print(f"Error executing:\n\n{sql}\n")
                print(f"Values: {values}")
                print(f"Error: {error}")
                pg.rollback()

    return True


# these temp directories are used to store ssh keys, because they will
# automatically clean themselves up when they go out of scope.
class SshKeyTempDir:
    def __init__(self):
        self.path = None

    def __enter__(self):
        self.path = tempfile.mkdtemp(dir="/tmp")
        return self.path

    def __exit__(self, exc_type, exc_val, exc_tb):
        shutil.rmtree(self.path)


def write_key_to_file(path, content):
    # Open the file with write permissions and create it if it doesn't exist
    fd = os.open(path, os.O_WRONLY | os.O_CREAT, 0o600)

    # Write the content to the file
    os.write(fd, content.encode())

    # Close the file
    os.close(fd)


if __name__ == "__main__":
    main()
