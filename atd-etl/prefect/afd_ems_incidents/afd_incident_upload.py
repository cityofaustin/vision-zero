#!/usr/bin/env python

"""
Name: AFD Incident Uploads
Description: This flow uploads AFD Incident Response CSVs (AFD Contact: Gus). 
    The data is emailed to atd-afd-incident-data@austinmobility.io daily ~ 3:30AM. From there it
    gets forwarded to a S3 bucket via AWS Simple Email Service.
Schedule: Daily at 03:30
Labels: test
"""

#alter table afd__incidents add column ems_incident_numbers integer[];
#alter table afd__incidents rename column ems_incident_number to unparsed_ems_incident_number;
#select dropgeometrycolumn('afd__incidents', 'geometry');
#select addgeometrycolumn('afd__incidents', 'geometry', 4326, 'point', 2); 

import prefect
from prefect import Flow, task, Parameter, case
import os
import datetime
import boto3
import pprint
import time
import email
import tempfile
import pandas
from datetime import datetime, timedelta
import psycopg2
import psycopg2.extras
from psycopg2 import Error
import numpy as np
from prefect.storage import GitHub
from prefect.run_configs import UniversalRun
from prefect.backend import get_key_value


pp = pprint.PrettyPrinter(indent=4)

FLOW_NAME = "afd_incident_upload"
# environment_variables = get_key_value(key="vision_zero_production")
environment_variables = get_key_value(key="vision_zero_staging")

# Retrieve the db configuration
# DB_USERNAME = environment_variables.DB_USERNAME
# DB_PASSWORD = environment_variables.DB_PASSWORD
# DB_HOSTNAME = environment_variables.DB_HOSTNAME
# DB_PORT = environment_variables.DB_PORT
# DB_DATABASE = environment_variables.DB_DATABASE

DB_USERNAME = os.getenv("AFD_DB_USERNAME")
DB_PASSWORD = os.getenv("AFD_DB_PASSWORD")
DB_HOSTNAME = os.getenv("AFD_DB_HOSTNAME")
DB_PORT = os.getenv("AFD_DB_PORT")
DB_DATABASE = os.getenv("AFD_DB_DATABASE")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AFD_S3_SOURCE_BUCKET = os.getenv("AFD_S3_SOURCE_BUCKET")
AFD_S3_ARCHIVE_BUCKET = os.getenv("AFD_S3_ARCHIVE_BUCKET")
AFD_S3_SOURCE_PREFIX = os.getenv("AFD_S3_SOURCE_PREFIX")
AFD_S3_ARCHIVE_PREFIX = os.getenv("AFD_S3_ARCHIVE_PREFIX")


@task
def get_timestamp():
    current = datetime.now()
    return time.mktime(current.timetuple())


@task
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


@task
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


@task
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

@task
def create_and_parse_dataframe(location):
    # Parse XLSX into pandas dataframe
    data = pandas.read_excel(f"{location}/attachment.xlsx", header=0)
    return data



@task
def upload_data_to_postgres(data, age_cutoff):
    if age_cutoff:
        data["Inc_Date"] = pandas.to_datetime(data["Inc_Date"], format="%Y-%m-%d")
        age_threshold = datetime.today() - timedelta(days=age_cutoff)
        fresh_data = data[data["Inc_Date"] > age_threshold] 
        print(fresh_data)


@task
def clean_up():
    # Clean up the file from temp location
    try:
        os.remove("/tmp/attach.csv")
    except OSError:
        pass


with Flow("AFD Import ETL") as flow:
    age_threshold = Parameter('full_import', default = False)
    timestamp = get_timestamp()
    newest_email = get_most_recent_email()
    attachment_location = extract_email_attachment(newest_email)
    uploaded_token = upload_attachment_to_S3(attachment_location, timestamp)
    data = create_and_parse_dataframe(attachment_location)
    # data.set_upstream(upload)

    pg_upload = upload_data_to_postgres(data, age_threshold)

    
    # if ONLY_SIXTY_DAYS:
    # partial upload
    # sixty_day_data = filter_data_to_last_sixty_days(data)
    # pg_upload = upload_data_to_postgres(sixty_day_data)
    # else:
    # pg_upload = upload_data_to_postgres(data)

    # cleanup = clean_up()
    # cleanup.set_upstream(pg_upload)


flow.run(parameters=dict(full_import=True))
# f.visualize()
# f.register(project_name="vision-zero")
