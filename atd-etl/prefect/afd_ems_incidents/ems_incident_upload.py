#!/usr/bin/env python

"""
Name: EMS Incident Uploads
Description: This flow uploads EMS Incident Response CSVs (EMS Contact: Lynn C). 
    The data is emailed to atd-ems-incident-data@austinmobility.io daily ~ 3:30AM. From there it
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
import math
from prefect.storage import GitHub
from prefect.run_configs import UniversalRun
from prefect.backend import get_key_value


pp = pprint.PrettyPrinter(indent=4)

FLOW_NAME = "ems_incident_upload"
# environment_variables = get_key_value(key="vision_zero_production")
environment_variables = get_key_value(key="vision_zero_staging")

# Retrieve the db configuration
DB_USERNAME = environment_variables.DB_USERNAME
DB_PASSWORD = environment_variables.DB_PASSWORD
DB_HOSTNAME = environment_variables.DB_HOSTNAME
DB_PORT = environment_variables.DB_PORT
DB_DATABASE = environment_variables.DB_DATABASE

# Configure code storage
STORAGE = GitHub(
    repo="cityofaustin/atd-prefect",
    path=f"flows/vision_zero/{FLOW_NAME}.py",
    ref="mc_8159_afd_etl_prefect",
)


@task
def get_timestamp():
    current = datetime.now()
    return f"{str(current.year)}-{str(current.month)}-{str(current.day)}-{str(current.hour)}-{str(current.minute)}-{str(current.second)}"


@task
def create_boto_client():
    # Initialize AWS clients and connect to S3 resources
    pp.pprint("Connecting to AWS S3  bucket...")
    aws_s3_client = boto3.client("s3")
    return aws_s3_client


@task
def get_most_recent_ems_email(bucket, client):
    """
    Find the most recently updated file in the bucket. This will be the newest email.
    Gets a string version of the Key representing the most recent S3 file.
    :param bucket: string key to bucket
    :param client: instance of S3 Client objects
    :return: string
    """

    # Stack Overflow helped:
    # https://stackoverflow.com/questions/45375999/how-to-download-the-latest-file-of-an-s3-bucket-using-boto3
    def get_last_modified(obj): return int(obj["LastModified"].strftime("%s"))

    all_bucket_objects = client.list_objects_v2(Bucket=bucket)["Contents"]
    # only look in "atd-ems/" directory
    raw_emails_list = [
        obj for obj in all_bucket_objects if "atd-ems/" in obj["Key"]]
    # Newest Key as string
    last_added_key = [
        obj["Key"] for obj in sorted(raw_emails_list, key=get_last_modified)
    ][-1]

    pp.pprint(f"Downloading file from S3: {last_added_key}")

    # Get the newest item in the bucket
    # https://gist.github.com/sandeepmanchi/365bff15f2f395eeee45dd2d70e85e09
    newest_object = client.get_object(
        Bucket=bucket,
        Key=last_added_key,
    )

    return newest_object


@task
def extract_email_attachment(email_file):
    contents = email_file["Body"].read().decode("utf-8")

    # Given the s3 object content is the SES email,
    # get the message content and attachment using email package
    msg = email.message_from_string(contents)
    attachment = msg.get_payload()[1]
    # Write the attachment to a temp location
    open("/tmp/attach.csv", "wb").write(attachment.get_payload(decode=True))
    return attachment


@task
def upload_attachment_to_S3(attachment, timestamp, aws_s3_client):
    # Upload the file to an archive location in S3 bucket and append timestamp to the filename
    # Extracted attachment is temporarily saved as attach.csv and then uploaded as upload-<timestamp>.xlsx
    try:
        aws_s3_client.upload_file(
            "/tmp/attach.csv",
            "atd-ems-incident-data",
            "attachments/upload-" + timestamp + ".csv",
        )
        pp.pprint(f"Upload Successful")
    except FileNotFoundError:
        pp.pprint("The file was not uploaded")


@task
def create_and_parse_dataframe():
    # Extract the csv from email
    data = pandas.read_csv(
        "/tmp/attach.csv",
        on_bad_lines="skip",
        engine="python",
        encoding="ISO-8859-1",
        index_col=None,
    )

    return data


@task
def filter_data_to_last_sixty_days(data):
    # Filter data to last 2 months of records
    # We learned that its rare for incident updates to change after the first 30 days.
    # Allowing 60 days just to be safe.
    data["Incident_Date_Received"] = pandas.to_datetime(
        data["Incident_Date_Received"], format="%Y-%m-%d"
    )

    today = datetime.today()
    sixty_days_ago = today - timedelta(days=60)

    data_60days = data[data["Incident_Date_Received"] > sixty_days_ago]

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

    for index, row in data.iterrows():
        print(row)

        if not index % 1000:
            print(str(index) + ":")

        # Split APD Incident Numbers when there is more than once
        apd_numbers = str(row["APD_Incident_Numbers"]).split(",")
        if len(apd_numbers) > 1:
            apd_number_1 = apd_numbers[0] or None
            apd_number_2 = apd_numbers[1] or None
        else:
            apd_number_1 = row["APD_Incident_Numbers"]
            apd_number_2 = None

        # Split MVC Form Extrication datetime str into Date & Time values
        if type(row["MVC_Form_Extrication_Time"]) is str:
            datetime_obj = datetime.strptime(
                row["MVC_Form_Extrication_Time"], '%Y-%m-%d %H:%M:%S')
            time = datetime_obj.time().strftime("%H:%M:%S")
            date = datetime_obj.date().strftime("%Y-%m-%d")
        else:
            time = None
            date = None

        sql = """
            insert into ems__incidents (
                pcr_key, 
                incident_date_received,
                incident_time_received,
                incident_number,
                incident_location_address,
                incident_location_city,
                incident_location_state,
                incident_location_zip,
                incident_location_longitude,
                incident_location_latitude,
                incident_problem,
                incident_priority_number,
                pcr_cause_of_injury,
                pcr_patient_complaints,
                pcr_provider_impression_primary,
                pcr_provider_impression_secondary,
                pcr_outcome,
                pcr_transport_destination,
                pcr_patient_acuity_level,
                pcr_patient_acuity_level_reason,
                pcr_patient_age,
                pcr_patient_gender,
                pcr_patient_race,
                mvc_form_airbag_deployment,
                mvc_form_airbag_deployment_status,
                mvc_form_collision_indicators,
                mvc_form_damage_location,
                mvc_form_estimated_speed_kph,
                mvc_form_estimated_speed_mph,
                mvc_form_extrication_comments,
                mvc_form_extrication_time,
                mvc_form_extrication_required_flag,
                mvc_form_patient_injured_flag,
                mvc_form_position_in_vehicle,
                mvc_form_safety_devices,
                mvc_form_seat_row_number,
                mvc_form_vehicle_type,
                mvc_form_weather,
                pcr_additional_agencies,
                pcr_transport_priority,
                apd_incident_numbers,
                pcr_patient_acuity_initial,
                pcr_patient_acuity_final,
                geometry,
                apd_incident_number_1, 
                apd_incident_number_2, 
                mvc_form_time, 
                mvc_form_date
            ) values (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                %s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326),
                %s, %s, %s, %s
            ) ON CONFLICT DO NOTHING;
        """
        values = [
            row["PCR_Key"],
            row["Incident_Date_Received"],
            row["Incident_Time_Received"],
            row["Incident_Number"],
            row["Incident_Location_Address"],
            row["Incident_Location_City"],
            row["Incident_Location_State"],
            row["Incident_Location_Zip"],
            row["Incident_Location_Longitude"],
            row["Incident_Location_Latitude"],
            row["Incident_Problem"],
            row["Incident_Priority_Number"],
            row["PCR_Cause_of_Injury"],
            row["PCR_Patient_Complaints"],
            row["PCR_Provider_Impression_Primary"],
            row["PCR_Provider_Impression_Secondary"],
            row["PCR_Outcome"],
            row["PCR_Transport_Destination"],
            row["PCR_Patient_Acuity_Level"],
            row["PCR_Patient_Acuity_Level_Reason"],
            row["PCR_Patient_Age"],
            row["PCR_Patient_Gender"],
            row["PCR_Patient_Race"],
            row["MVC_Form_Airbag_Deployment"],
            row["MVC_Form_Airbag_Deployment_Status"],
            row["MVC_Form_Collision_Indicators"],
            row["MVC_Form_Damage_Location"],
            row["MVC_Form_Estimated_Speed_Kph"],
            row["MVC_Form_Estimated_Speed_Mph"],
            row["MVC_Form_Extrication_Comments"],
            row["MVC_Form_Extrication_Time"],
            row["MVC_Form_Extrication_Required_Flag"],
            row["MVC_Form_Patient_Injured_Flag"],
            row["MVC_Form_Position_In_Vehicle"],
            row["MVC_Form_Safety_Devices"],
            row["MVC_Form_Seat_Row_Number"],
            row["MVC_Form_Vehicle_Type"],
            row["MVC_Form_Weather"],
            row["PCR_Additional_Agencies"],
            row["PCR_Transport_Priority"],
            row["APD_Incident_Numbers"],
            row["PCR_Patient_Acuity_Initial"],
            row["PCR_Patient_Acuity_Final"],
            row["Incident_Location_Longitude"],
            row["Incident_Location_Latitude"],
            apd_number_1,
            apd_number_2,
            time,
            date
        ]

        cursor.execute(sql, values)
    connection.commit()

    if connection:
        connection.close()
        print("PostgreSQL connection is closed")


@task
def clean_up():
    # Clean up the file from temp location
    os.remove("/tmp/attach.csv")


with Flow(
    FLOW_NAME,
    storage=STORAGE,
    run_config=UniversalRun(
        labels=["atd-data02", "staging"], env={"EXTRA_PIP_PACKAGES": "pandas"}
    ),
) as f:
    timestamp = get_timestamp()
    aws_s3_client = create_boto_client()
    newest_email = get_most_recent_ems_email(
        "atd-ems-incident-data", aws_s3_client)
    attachment = extract_email_attachment(newest_email)
    upload = upload_attachment_to_S3(attachment, timestamp, aws_s3_client)
    data = create_and_parse_dataframe()
    data.set_upstream(upload)

    ONLY_SIXTY_DAYS = False

    if ONLY_SIXTY_DAYS:
        # partial upload
        sixty_day_data = filter_data_to_last_sixty_days(data)
        pg_upload = upload_data_to_postgres(sixty_day_data)
    else:
        pg_upload = upload_data_to_postgres(data)

    cleanup = clean_up()
    cleanup.set_upstream(pg_upload)


f.run()
# f.visualize()
# f.register(project_name="vision-zero")
