#!/usr/bin/env python

"""
Name: EMS Incident Uploads
Description:
    This script is used to upload EMS incident data to the Vision Zero Database. It's 
    parsed from data stored in an S3 bucket that is populated by an automated email from the
    upstream source of the data.

    The data is emailed to atd-ems-incident-data@austinmobility.io daily ~ 3:30AM. From there it
    gets forwarded to a S3 bucket via AWS Simple Email Service.

    (EMS Contact: Lynn C). 
Local / development execution:
    docker compose run -it import ems
"""

import datetime
import json
import os
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
from sshtunnel import SSHTunnelForwarder

import onepasswordconnectsdk
from onepasswordconnectsdk.client import Client, new_client

# Heads up! Looking for global code? Look just below this get_secrets() function.


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
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.EMS S3 Source Bucket",
            "opvault": VAULT_ID,
        },
        "source_prefix": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.EMS S3 Source Prefix",
            "opvault": VAULT_ID,
        },
        "archive_bucket": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.EMS S3 Archive Bucket",
            "opvault": VAULT_ID,
        },
        "archive_prefix": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.EMS S3 Archive Prefix",
            "opvault": VAULT_ID,
        },
        "bastion_ssh_private_key": {
            "opitem": "RDS Bastion Key",
            "opfield": ".private key",
            "opvault": VAULT_ID,
        },
        "record_age_maximum_in_days": {
            "opitem": "Vision Zero AFD and EMS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.EMS Record Age Maximum in Days",
            "opvault": VAULT_ID,
        },
    }

    # instantiate a 1Password client
    client: Client = new_client(ONEPASSWORD_CONNECT_HOST, ONEPASSWORD_CONNECT_TOKEN)
    # get the requested secrets from 1Password
    return onepasswordconnectsdk.load_dict(client, REQUIRED_SECRETS)


pp = pprint.PrettyPrinter(indent=4)

DEPLOYMENT_ENVIRONMENT = os.environ.get(
    "ENVIRONMENT", "development"
)  # our current environment from ['production', 'development']
ONEPASSWORD_CONNECT_TOKEN = os.getenv("OP_API_TOKEN")  # our secret to get secrets 🤐
ONEPASSWORD_CONNECT_HOST = os.getenv("OP_CONNECT")  # where we get our secrets
VAULT_ID = os.getenv("OP_VAULT_ID")

secrets = get_secrets()

DB_USERNAME = secrets["database_username"]
DB_PASSWORD = secrets["database_password"]
DB_HOSTNAME = secrets["database_host"]
DB_PORT = 5432
DB_DATABASE = secrets["database_name"]
AWS_ACCESS_KEY_ID = secrets["aws_access_key"]
AWS_SECRET_ACCESS_KEY = secrets["aws_secret_key"]
EMS_S3_SOURCE_BUCKET = secrets["source_bucket"]
EMS_S3_ARCHIVE_BUCKET = secrets["archive_bucket"]
EMS_S3_SOURCE_PREFIX = secrets["source_prefix"]
EMS_S3_ARCHIVE_PREFIX = secrets["archive_prefix"]
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

    bucket = s3.Bucket(EMS_S3_SOURCE_BUCKET)

    files = []
    for file in bucket.objects.filter(Prefix=EMS_S3_SOURCE_PREFIX):
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
    open(f"{tmpdir}/attachment.csv", "wb").write(attachment.get_payload(decode=True))
    return tmpdir


def upload_attachment_to_S3(location, timestamp):
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
    s3 = session.resource("s3")

    s3.Bucket(EMS_S3_ARCHIVE_BUCKET).upload_file(
        f"{location}/attachment.csv",
        f"{EMS_S3_ARCHIVE_PREFIX}upload-{timestamp}.csv",
    )
    return True


def create_and_parse_dataframe(location):
    # Parse CSV into pandas dataframe
    data = pandas.read_csv(
        f"{location}/attachment.csv",
        header=0,
        on_bad_lines="skip",
        encoding="ISO-8859-1",
    )
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
        if age_cutoff > 0:
            data["Incident_Date_Received"] = pandas.to_datetime(
                data["Incident_Date_Received"], format="%Y-%m-%d"
            )
            age_threshold = datetime.today() - timedelta(days=age_cutoff)
            data = data[data["Incident_Date_Received"] > age_threshold]
        print(f"Trimmed data shape: {data.shape}")
        print(data)

        # this emits indices in reverse order, very odd, but not a problem
        for index, row in data.iloc[::-1].iterrows():
            if not index % 100:
                print(f"Row {str(index)} of {str(data.shape[0])}")
            # print(data["Incident_Date_Received"][index])

            apd_incident_numbers = (
                str(row["APD_Incident_Numbers"])
                .replace("-", "")
                .replace(" ", "")
                .split(",")
            )
            apd_incident_numbers[:] = (
                value for value in apd_incident_numbers if not value == "nan"
            )
            if len(apd_incident_numbers) > 1:
                pass
                # print(f"🛎 Found multiple incident numbers: " + str(row["EMS_IncidentNumber"]))

            sql = "select count(id) as existing from ems__incidents where incident_number = %s"

            cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cursor.execute(sql, (row["Incident_Number"],))
            existing = cursor.fetchone()

            sql = ""
            values = []

            if existing["existing"] > 0:
                # print("Update")
                sql = """
                    update ems__incidents set
                        incident_date_received = %s,
                        incident_time_received = %s,
                        incident_number = %s,
                        incident_location_address = %s,
                        incident_location_city = %s,
                        incident_location_state = %s,
                        incident_location_zip = %s,
                        incident_location_longitude = %s,
                        incident_location_latitude = %s,
                        incident_problem = %s,
                        incident_priority_number = %s,
                        pcr_cause_of_injury = %s,
                        pcr_patient_complaints = %s,
                        pcr_provider_impression_primary = %s,
                        pcr_provider_impression_secondary = %s,
                        pcr_outcome = %s,
                        pcr_transport_destination = %s,
                        pcr_patient_acuity_level = %s,
                        pcr_patient_acuity_level_reason = %s,
                        pcr_patient_age = %s,
                        pcr_patient_gender = %s,
                        pcr_patient_race = %s,
                        mvc_form_airbag_deployment = %s,
                        mvc_form_airbag_deployment_status = %s,
                        mvc_form_collision_indicators = %s,
                        mvc_form_damage_location = %s,
                        mvc_form_estimated_speed_kph = %s,
                        mvc_form_estimated_speed_mph = %s,
                        mvc_form_extrication_comments = %s,
                        mvc_form_extrication_datetime = %s,
                        mvc_form_extrication_required_flag = %s,
                        mvc_form_patient_injured_flag = %s,
                        mvc_form_position_in_vehicle = %s,
                        mvc_form_safety_devices = %s,
                        mvc_form_seat_row_number = %s,
                        mvc_form_vehicle_type = %s,
                        mvc_form_weather = %s,
                        pcr_additional_agencies = %s,
                        pcr_transport_priority = %s,
                        unparsed_apd_incident_numbers = %s,
                        pcr_patient_acuity_initial = %s,
                        pcr_patient_acuity_final = %s,
                        geometry = ST_SetSRID(ST_Point(%s, %s), 4326),
                        apd_incident_numbers = %s
                    where pcr_key = %s
                    
                """
                values = [
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
                    "{" + ", ".join(apd_incident_numbers) + "}",
                    row["PCR_Key"],
                ]

                for i in range(len(values)):
                    if pandas.isna(values[i]):
                        values[i] = None
            else:
                # print("Insert")
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
                        mvc_form_extrication_datetime,
                        mvc_form_extrication_required_flag,
                        mvc_form_patient_injured_flag,
                        mvc_form_position_in_vehicle,
                        mvc_form_safety_devices,
                        mvc_form_seat_row_number,
                        mvc_form_vehicle_type,
                        mvc_form_weather,
                        pcr_additional_agencies,
                        pcr_transport_priority,
                        unparsed_apd_incident_numbers,
                        pcr_patient_acuity_initial,
                        pcr_patient_acuity_final,
                        geometry,
                        apd_incident_numbers
                    ) values (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                        %s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326),
                        %s
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
                    "{" + ", ".join(apd_incident_numbers) + "}",
                ]

                for i in range(len(values)):
                    if pandas.isna(values[i]):
                        values[i] = None

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
