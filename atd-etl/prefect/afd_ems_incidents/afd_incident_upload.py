#!/usr/bin/env python

"""
Name: AFD Incident Uploads
Description: This flow uploads AFD Incident Response CSVs (AFD Contact: Gus). 
    The data is emailed to atd-afd-incident-data@austinmobility.io daily ~ 3:30AM. From there it
    gets forwarded to a S3 bucket via AWS Simple Email Service.
Schedule: Daily at 03:30
Labels: test
"""

from prefect import Flow, task
import os
import datetime
import boto3
import pprint
import email
import pandas
from datetime import datetime, timedelta
import psycopg2
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
#DB_USERNAME = environment_variables.DB_USERNAME
#DB_PASSWORD = environment_variables.DB_PASSWORD
#DB_HOSTNAME = environment_variables.DB_HOSTNAME
#DB_PORT = environment_variables.DB_PORT
#DB_DATABASE = environment_variables.DB_DATABASE

DB_USERNAME = os.getenv('AFD_DB_USERNAME')
DB_PASSWORD = os.getenv('AFD_DB_PASSWORD')
DB_HOSTNAME = os.getenv('AFD_DB_HOSTNAME')
DB_PORT     = os.getenv('AFD_DB_PORT')
DB_DATABASE = os.getenv('AFD_DB_DATABASE')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AFD_S3_SOURCE_BUCKET = os.getenv('AFD_S3_SOURCE_BUCKET')
AFD_S3_SOURCE_PREFIX = os.getenv('AFD_S3_SOURCE_PREFIX')


@task
def get_timestamp():
    current = datetime.now()
    return f"{str(current.year)}-{str(current.month)}-{str(current.day)}-{str(current.hour)}-{str(current.minute)}-{str(current.second)}"


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

    # FIXME we have a hardcoded value here denoting a S3 prefix
    files = []
    for file in bucket.objects.filter(Prefix=AFD_S3_SOURCE_PREFIX):
        files.append(file)
    files.sort(key=lambda x: x.last_modified, reverse=True)

    file = files[0].get()
    email = file["Body"].read().decode("utf-8")

    return email


@task
def extract_email_attachment(email_file):
    contents = email_file["Body"].read().decode("utf-8")

    # Given the s3 object content is the SES email,
    # get the message content and attachment using email package
    msg = email.message_from_string(contents)
    attachment = msg.get_payload()[1]
    # Write the attachment to a temp location
    open("/tmp/attach.xlsx", "wb").write(attachment.get_payload(decode=True))
    return attachment


@task
def upload_attachment_to_S3(attachment, timestamp, aws_s3_client):
    # Upload the file to an archive location in S3 bucket and append timestamp to the filename
    # Extracted attachment is temporarily saved as attach.csv and then uploaded as upload-<timestamp>.xlsx
    try:
        aws_s3_client.upload_file(
            "/tmp/attach.csv",
            "atd-afd-incident-data",
            "attachments/upload-" + timestamp + ".xlsx",
        )
        pp.pprint(f"Upload Successful")
    except FileNotFoundError:
        pp.pprint("The file was not uploaded")


@task
def create_and_parse_dataframe():
    # Extract the csv from email
    data = pandas.read_excel("/tmp/attach.xlsx", header=0)

    return data


@task
def filter_data_to_last_sixty_days(data):
    # Filter data to last 2 months of records
    # We learned that its rare for incident updates to change after the first 30 days.
    # Allowing 60 days just to be safe.
    data["Inc_Date"] = pandas.to_datetime(data["Inc_Date"], format="%Y-%m-%d")

    today = datetime.today()
    sixty_days_ago = today - timedelta(days=60)

    data_60days = data[data["Inc_Date"] > sixty_days_ago]

    return data_60days


@task
def upload_data_to_postgres(data):
    try:
        connection = psycopg2.connect(
            user=DB_USERNAME,
            password=DB_PASSWORD,
            host=DB_HOSTNAME,
            port=DB_PORT,
            database=DB_DATABASE,
        )
        cursor = connection.cursor()
        cursor.execute("TRUNCATE afd__incidents;")
        cursor.close()
    except (Exception, Error) as error:
        print("Error while connecting to PostgreSQL", error)

    # Format NaN values for DB
    # https://stackoverflow.com/questions/32107558/how-do-i-convert-numpy-nan-objects-to-sql-nulls
    def nan_to_null(
        f, _NULL=psycopg2.extensions.AsIs("NULL"), _Float=psycopg2.extensions.Float
    ):
        if not np.isnan(f):
            return _Float(f)
        return _NULL

    psycopg2.extensions.register_adapter(float, nan_to_null)

    cursor = connection.cursor()

    for index, row in data.iloc[::-1].iterrows():
        print(row)
        if not index % 1000:
            print(str(index) + ":")

        # Split EMS Incident Numbers when there is more than once.
        # Also format incident number to exclude "-"
        ems_numbers = str(row["EMS_IncidentNumber"]
                          ).replace('-', '').split(";")
        ems_number_1 = ems_numbers[0] or None
        if len(ems_numbers) > 1:
            ems_number_2 = ems_numbers[1] or None
        else:
            ems_number_2 = None

        # Prevent geometry creation error on "-" X/Y value
        longitude = row["X"]
        latitude = row["Y"]
        if row["X"] == '-':
            longitude = None
        if row["Y"] == '-':
            latitude = None

        sql = """
            insert into afd__incidents (
                incident_number, 
                ems_incident_number_raw, 
                call_datetime, 
                calendar_year, 
                jurisdiction, 
                address, 
                problem, 
                flagged_incs, 
                geometry,
                ems_incident_number_1,
                ems_incident_number_2,
                call_date,
                call_time,
                latitude,
                longitude
            ) values (
                %s, %s, %s, %s, %s, %s, %s, %s, 
                ST_SetSRID(ST_Point(%s, %s), 4326),
                %s, %s, %s, %s, %s, %s
            ) ON CONFLICT DO NOTHING;
        """
        values = [
            row["Incident_Number"],
            row["EMS_IncidentNumber"],
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
            ems_number_1,
            ems_number_2,
            row["Inc_Date"].strftime("%Y-%m-%d"),
            row["Inc_Time"].strftime("%H:%M:%S"),
            longitude,
            latitude
        ]

        cursor.execute(sql, values)
    connection.commit()

    if connection:
        connection.close()
        print("PostgreSQL connection is closed")


@task
def clean_up():
    # Clean up the file from temp location
    try:
        os.remove("/tmp/attach.csv")
    except OSError:
        pass


with Flow(
    "AFD Import ETL"
    ) as flow:
    timestamp = get_timestamp()
    newest_email = get_most_recent_email()
    #attachment = extract_email_attachment(newest_email)
    #upload = upload_attachment_to_S3(attachment, timestamp, aws_s3_client)
    #data = create_and_parse_dataframe()
    #data.set_upstream(upload)

    #ONLY_SIXTY_DAYS = False

    #if ONLY_SIXTY_DAYS:
        # partial upload
        #sixty_day_data = filter_data_to_last_sixty_days(data)
        #pg_upload = upload_data_to_postgres(sixty_day_data)
    #else:
        #pg_upload = upload_data_to_postgres(data)

    #cleanup = clean_up()
    #cleanup.set_upstream(pg_upload)


flow.run()
# f.visualize()
# f.register(project_name="vision-zero")
