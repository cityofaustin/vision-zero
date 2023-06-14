#!/usr/bin/env python

"""
Name: AFD Incident Uploads
Description: This flow uploads AFD Incident Response CSVs
    The data is emailed to atd-afd-incident-data@austinmobility.io daily ~ 6:30AM. From there it
    gets forwarded to a S3 bucket via AWS Simple Email Service.
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

pp = pprint.PrettyPrinter(indent=4)


def main():
    pass
    #record_age_maximum = RECORD_AGE_MAXIMUM or 15
    #timestamp = get_timestamp()
    #newest_email = get_most_recent_email()
    #attachment_location = extract_email_attachment(newest_email)
    #uploaded_token = upload_attachment_to_S3(attachment_location, timestamp)
    #data = create_and_parse_dataframe(attachment_location)
    #upload_token = upload_data_to_postgres(data, record_age_maximum)
    #clean_up_token = clean_up(attachment_location, upstream_tasks=[upload_token])

DB_USERNAME = None
DB_PASSWORD = None
DB_HOSTNAME = None
DB_PORT = None
DB_DATABASE = None
AWS_ACCESS_KEY_ID = None
AWS_SECRET_ACCESS_KEY = None
AFD_S3_SOURCE_BUCKET = None
AFD_S3_ARCHIVE_BUCKET = None
AFD_S3_SOURCE_PREFIX = None
AFD_S3_ARCHIVE_PREFIX = None
DB_BASTION_HOST = None
DB_RDS_HOST = None
RECORD_AGE_MAXIMUM = None


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

    ssh_tunnel = SSHTunnelForwarder(
        (DB_BASTION_HOST),
        ssh_username="vz-etl",
        ssh_private_key= '/root/.ssh/id_rsa', # will switch to ed25519 when we rebuild this for prefect 2
        remote_bind_address=(DB_RDS_HOST, 5432)
        )
    ssh_tunnel.start()   

    pg = psycopg2.connect(
        host='localhost', 
        port=ssh_tunnel.local_bind_port,
        user=DB_USERNAME, 
        password=DB_PASSWORD, 
        dbname=DB_DATABASE
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
            pg.rollback()

    return True


def clean_up(path):
    # Clean up the temp location
    shutil.rmtree(path)




if __name__ == "__main__":
    main()