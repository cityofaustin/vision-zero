#!/usr/bin/env python

"""
Name: AFD Incident Uploads
Description: This flow uploads AFD Incident Response CSVs (AFD Contact: Gus). 
    The data is emailed to atd-afd-incident-data@austinmobility.io daily ~ 3:30AM. From there it
    gets forwarded to a S3 bucket via AWS Simple Email Service.
Schedule: Daily at 03:30
Labels: test
"""

# alter table afd__incidents add column ems_incident_numbers integer[];
# alter table afd__incidents rename column ems_incident_number to unparsed_ems_incident_number;
# select dropgeometrycolumn('afd__incidents', 'geometry');
# select addgeometrycolumn('afd__incidents', 'geometry', 4326, 'point', 2);

import prefect
from prefect import Flow, task, Parameter, case
import os
import datetime
import boto3
import pprint
import time
import email
import tempfile
import shutil
import pandas
from datetime import datetime, timedelta
import psycopg2
import psycopg2.extras
from psycopg2 import Error
from prefect.storage import GitHub
from prefect.run_configs import UniversalRun
from prefect.backend import get_key_value


pp = pprint.PrettyPrinter(indent=4)

# environment_variables = get_key_value(key="Vision Zero")
environment_variables = get_key_value(key="Vision Zero Development")

# Retrieve the db configuration
DB_USERNAME = environment_variables.DB_USERNAME
DB_PASSWORD = environment_variables.DB_PASSWORD
DB_HOSTNAME = environment_variables.DB_HOSTNAME
DB_PORT = environment_variables.DB_PORT
DB_DATABASE = environment_variables.DB_DATABASE
AWS_ACCESS_KEY_ID = environment_variables.AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY = environment_variables.AWS_SECRET_ACCESS_KEY
AFD_S3_SOURCE_BUCKET = environment_variables.AFD_S3_SOURCE_BUCKET
AFD_S3_ARCHIVE_BUCKET = environment_variables.AFD_S3_ARCHIVE_BUCKET
AFD_S3_SOURCE_PREFIX = environment_variables.AFD_S3_SOURCE_PREFIX
AFD_S3_ARCHIVE_PREFIX = environment_variables.AFD_S3_ARCHIVE_PREFIX

# DB_USERNAME = os.getenv("AFD_DB_USERNAME")
# DB_PASSWORD = os.getenv("AFD_DB_PASSWORD")
# DB_HOSTNAME = os.getenv("AFD_DB_HOSTNAME")
# DB_PORT = os.getenv("AFD_DB_PORT")
# DB_DATABASE = os.getenv("AFD_DB_DATABASE")
# AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
# AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
# AFD_S3_SOURCE_BUCKET = os.getenv("AFD_S3_SOURCE_BUCKET")
# AFD_S3_ARCHIVE_BUCKET = os.getenv("AFD_S3_ARCHIVE_BUCKET")
# AFD_S3_SOURCE_PREFIX = os.getenv("AFD_S3_SOURCE_PREFIX")
# AFD_S3_ARCHIVE_PREFIX = os.getenv("AFD_S3_ARCHIVE_PREFIX")


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

    logger = prefect.context.get("logger")
    logger.info(f"Tmpdir: {tmpdir}")

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
    pg = psycopg2.connect(
        host=DB_HOSTNAME, user=DB_USERNAME, password=DB_PASSWORD, dbname=DB_DATABASE
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
            # print(f"🛎 Found multiple ems numbers: " + str(row["EMS_IncidentNumber"]))

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
            # print("Updating existing record")
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
            # print("Inserting new record")
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

    return True


@task
def clean_up(path):
    # Clean up the temp location
    shutil.rmtree(path)


with Flow("AFD Import ETL") as flow:
    record_age_maximum = Parameter("record_age_maximum", default=False)
    timestamp = get_timestamp()
    newest_email = get_most_recent_email()
    attachment_location = extract_email_attachment(newest_email)
    uploaded_token = upload_attachment_to_S3(attachment_location, timestamp)
    data = create_and_parse_dataframe(attachment_location)
    upload_token = upload_data_to_postgres(data, record_age_maximum)
    clean_up_token = clean_up(attachment_location, upstream_tasks=[upload_token])

# you can use record_age_maximum=False if you want a full import
flow.run(parameters=dict(record_age_maximum=60))
# f.register(project_name="vision-zero")
