#!/usr/bin/env python3

import re
import os
import json
import psycopg2
import psycopg2.extras
import datetime
import tempfile
import shutil

from sshtunnel import SSHTunnelForwarder

import onepasswordconnectsdk
from onepasswordconnectsdk.client import Client, new_client

DEPLOYMENT_ENVIRONMENT = os.environ.get(
    "ENVIRONMENT", "development"
)  # our current environment from ['production', 'development']
ONEPASSWORD_CONNECT_TOKEN = os.getenv("OP_API_TOKEN")  # our secret to get secrets 🤐
ONEPASSWORD_CONNECT_HOST = os.getenv("OP_CONNECT")  # where we get our secrets
VAULT_ID = os.getenv("OP_VAULT_ID")

def main():
    secrets = get_secrets()
    global SFTP_ENDPOINT
    global ZIP_PASSWORD

    global AWS_ACCESS_KEY_ID
    global AWS_SECRET_ACCESS_KEY
    global AWS_CSV_ARCHIVE_BUCKET_NAME
    global AWS_CSV_ARCHIVE_PATH

    global DB_HOST
    global DB_USER
    global DB_PASS
    global DB_NAME
    global DB_SSL_REQUIREMENT

    global DB_BASTION_HOST_SSH_USERNAME
    global DB_BASTION_HOST_SSH_PRIVATE_KEY
    global DB_BASTION_HOST
    global DB_RDS_HOST

    global SFTP_ENDPOINT_SSH_PRIVATE_KEY

    SFTP_ENDPOINT = secrets["SFTP_endpoint"]
    ZIP_PASSWORD = secrets["archive_extract_password"]

    AWS_ACCESS_KEY_ID = secrets["aws_access_key"]
    AWS_SECRET_ACCESS_KEY = secrets["aws_secret_key"]
    AWS_CSV_ARCHIVE_BUCKET_NAME = secrets["s3_archive_bucket_name"]
    AWS_CSV_ARCHIVE_PATH = secrets["s3_archive_path"]

    DB_HOST = secrets["database_host"]
    DB_USER = secrets["database_username"]
    DB_PASS = secrets["database_password"]
    DB_NAME = secrets["database_name"]
    DB_SSL_REQUIREMENT = secrets["database_ssl_policy"]

    DB_BASTION_HOST_SSH_USERNAME = secrets["bastion_ssh_username"]
    DB_BASTION_HOST_SSH_PRIVATE_KEY = secrets["bastion_ssh_private_key"]
    DB_BASTION_HOST = secrets["bastion_host"]
    DB_RDS_HOST = secrets["database_host"]

    SFTP_ENDPOINT_SSH_PRIVATE_KEY = secrets["sftp_endpoint_private_key"]

    compute_for_crashes()
    compute_for_units()
    compute_for_person()
    compute_for_primaryperson()

def values_for_sql(values):
    strings = []
    for value in values:
        # print(value, type(value))
        # print(value, isinstance(value, datetime.datetime))
        if isinstance(value, str):
            value = re.sub("'", "''", value)
            strings.append(f"'{value}'")
        elif isinstance(value, list):
            strings.append(f"'{json.dumps(value)}'")
        elif isinstance(value, dict):
            strings.append(f"'{json.dumps(value)}'")
        elif isinstance(value, datetime.date):
            strings.append(f"'{str(value)}'")
        elif isinstance(value, datetime.datetime):
            strings.append(f"'{str(value)}'")
        elif isinstance(value, datetime.time):
            strings.append(f"'{str(value)}'")
        elif value is None:
            strings.append("null")
        else:
            strings.append(f"{str(value)}")
    return strings

def get_secrets():
    REQUIRED_SECRETS = {
        "SFTP_endpoint": {
            "opitem": "Vision Zero CRIS Import",
            "opfield": f"Common.SFTP Endpoint",
            "opvault": VAULT_ID,
        },
        "sftp_endpoint_private_key": {
            "opitem": "SFTP Endpoint Key",
            "opfield": ".private key",
            "opvault": VAULT_ID,
        },
        "archive_extract_password": {
            "opitem": "Vision Zero CRIS Import",
            "opfield": "Common.CRIS Archive Extract Password",
            "opvault": VAULT_ID,
        },
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
            "opitem": "Vision Zero CRIS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AWS Access key",
            "opvault": VAULT_ID,
        },
        "aws_secret_key": {
            "opitem": "Vision Zero CRIS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.AWS Secret key",
            "opvault": VAULT_ID,
        },
        "s3_archive_bucket_name": {
            "opitem": "Vision Zero CRIS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.S3 Archive Bucket Name",
            "opvault": VAULT_ID,
        },
        "s3_archive_path": {
            "opitem": "Vision Zero CRIS Import",
            "opfield": f"{DEPLOYMENT_ENVIRONMENT}.S3 Archive Path",
            "opvault": VAULT_ID,
        },
        "sftp_endpoint_private_key": {
            "opitem": "SFTP Endpoint Key",
            "opfield": ".private key",
            "opvault": VAULT_ID,
            },
        "bastion_ssh_private_key": {
            "opitem": "RDS Bastion Key",
            "opfield": ".private key",
            "opvault": VAULT_ID,
            },
    }

    # instantiate a 1Password client
    client: Client = new_client(ONEPASSWORD_CONNECT_HOST, ONEPASSWORD_CONNECT_TOKEN)
    # get the requested secrets from 1Password
    return onepasswordconnectsdk.load_dict(client, REQUIRED_SECRETS)


def get_pg_connection():
    """
    Returns a connection to the Postgres database
    """
    return psycopg2.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME,
        sslmode=DB_SSL_REQUIREMENT,
        sslrootcert="/root/rds-combined-ca-bundle.pem",
    )


def compute_for_crashes():
    with SshKeyTempDir() as key_directory:
        write_key_to_file(key_directory + "/id_ed25519", DB_BASTION_HOST_SSH_PRIVATE_KEY + "\n") 
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
            user=DB_USER,
            password=DB_PASS,
            dbname=DB_NAME,
            sslmode=DB_SSL_REQUIREMENT,
            sslrootcert="/root/rds-combined-ca-bundle.pem",
        )

        cris_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        public_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        vz_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        vz_cursor.execute('truncate vz_facts.atd_txdot_crashes cascade')
        pg.commit()

        sql = """
            select * from cris_facts.atd_txdot_crashes 
            order by crash_id asc
            """
        cris_cursor.execute(sql)
        for cris in cris_cursor:

            print()
            print("CRIS: ", cris["crash_id"])
            sql = "select * from production_fact_tables.atd_txdot_crashes where crash_id = %s"
            public_cursor.execute(sql, (int(cris["crash_id"]),))
            public = public_cursor.fetchone()
            #print("public: ", public)
            sql = None
            keys = ()
            values = ()
            if public is None:
                # we have a crash in CRIS that is not in the old VZDB
                #sql = "insert into vz_facts.atd_txdot_crashes (crash_id) values (%s)"
                keys = ["crash_id"]
                values = [cris["crash_id"]]
                print("Crash missing from old VZ data: ", cris["crash_id"])
            else:
                # print("public: ", public["crash_id"])
                keys = ["crash_id"]
                values = [cris["crash_id"]]
                for k, v in cris.items():
                    if (k in ('crash_id', 'council_district', 'in_austin_full_purpose')): # use to define fields to ignore
                        continue
                    # if k == 'position':
                        # print ("cris position:   ", v)
                        # print ("public position: ", public[k])

                    if v != public[k]:
                        # print("Δ ", k, ": ", public[k], " → ", v)
                        keys.append(k)
                        values.append(public[k])
            comma_linefeed = ",\n            "
            sql = f"""
            insert into vz_facts.atd_txdot_crashes (
                {comma_linefeed.join(keys)}
            ) values (
                {comma_linefeed.join(values_for_sql(values))}
            );
            """
            # print(sql)
            try:
                vz_cursor.execute(sql)
                pg.commit()
            except:
                print("keys: ", keys)
                print("values: ", values)
                print("ERROR: ", sql)
            print("Inserted: ", cris["crash_id"])
            # input("Press Enter to continue...")


def compute_for_units():
    with SshKeyTempDir() as key_directory:
        write_key_to_file(key_directory + "/id_ed25519", DB_BASTION_HOST_SSH_PRIVATE_KEY + "\n") 
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
            user=DB_USER,
            password=DB_PASS,
            dbname=DB_NAME,
            sslmode=DB_SSL_REQUIREMENT,
            sslrootcert="/root/rds-combined-ca-bundle.pem",
        )

        cris_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        public_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        vz_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        vz_cursor.execute('truncate vz_facts.atd_txdot_units')
        pg.commit()

            # where cris.atd_txdot_units.crash_id > 19102309
        sql = """
            select * 
            from cris_facts.atd_txdot_units 
            order by crash_id asc, unit_nbr asc
            """
        cris_cursor.execute(sql)
        for cris in cris_cursor:
            # This is a special case where CRIS reports a third unit where there is none.
            # It needs to be handled here because we have manually removed that crash from the VZDB.
            if cris["crash_id"] == 15359065 and cris["unit_nbr"] == 3:
                continue

            print()
            print("Crash ID: ", cris["crash_id"], "; Unit Number: ", cris["unit_nbr"])
            sql = "select * from production_fact_tables.atd_txdot_units where crash_id = %s and unit_nbr = %s"
            public_cursor.execute(sql, (cris["crash_id"], cris["unit_nbr"]))
            public = public_cursor.fetchone()
            # print("public: ", public)
            keys = ["crash_id", "unit_nbr"]
            values = [cris["crash_id"], cris["unit_nbr"]]
            if public is None:
                print("Public is empty for this unit!")
                keys = ["crash_id", "unit_nbr"]
                values = [cris["crash_id"], cris["unit_nbr"]]
                print(f"Unit {cris['crash_id']}, {cris['unit_nbr']} is missing from old VZ data")
            else:
                for k, v in cris.items():
                    if (k in ('crash_id', 'unit_nbr')): # use to define fields to ignore
                        continue
                    # print(k, v, public[k])
                    if v != public[k]:
                        # print("Δ ", k, ": ", public[k], " → ", v)
                        keys.append(k)
                        values.append(public[k])

            comma_linefeed = ",\n            "
            sql = f"""
            insert into vz_facts.atd_txdot_units (
                {comma_linefeed.join(keys)}
            ) values (
                {comma_linefeed.join(values_for_sql(values))}
            );
            """
            # print(sql)
            try:
                vz_cursor.execute(sql)
                pg.commit()
            except:
                print("keys: ", keys)
                print("values: ", values)
                print("ERROR: ", sql)
            print("Inserted: crash_id: ", cris["crash_id"], "; unit_nbr: ", cris["unit_nbr"])
            # input("Press Enter to continue...")


def compute_for_person():
    
    with SshKeyTempDir() as key_directory:
        write_key_to_file(key_directory + "/id_ed25519", DB_BASTION_HOST_SSH_PRIVATE_KEY + "\n") 
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
            user=DB_USER,
            password=DB_PASS,
            dbname=DB_NAME,
            sslmode=DB_SSL_REQUIREMENT,
            sslrootcert="/root/rds-combined-ca-bundle.pem",
        )


        cris_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        public_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        vz_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        vz_cursor.execute('truncate vz_facts.atd_txdot_person')
        pg.commit()

        sql = """
            select * 
            from cris_facts.atd_txdot_person 
            order by 
                crash_id asc, 
                unit_nbr asc, 
                prsn_nbr asc, 
                prsn_type_id asc, 
                prsn_occpnt_pos_id asc
            """
        cris_cursor.execute(sql)
        for cris in cris_cursor:
            print()
            print("Crash ID: ", cris["crash_id"], "; Unit Number: ", cris["unit_nbr"], "; Person Number: ", cris["prsn_nbr"], "; Person Type ID: ", cris["prsn_type_id"], "; Person Occupant Position ID: ", cris["prsn_occpnt_pos_id"])
            sql = "select * from production_fact_tables.atd_txdot_person where crash_id = %s and unit_nbr = %s and prsn_nbr = %s and prsn_type_id = %s and prsn_occpnt_pos_id = %s"
            # print(sql)
            public_cursor.execute(sql, (cris["crash_id"], cris["unit_nbr"], cris["prsn_nbr"], cris["prsn_type_id"], cris["prsn_occpnt_pos_id"]))
            public = public_cursor.fetchone()
            keys =  [ "crash_id", "unit_nbr", "prsn_nbr", "prsn_type_id", "prsn_occpnt_pos_id"]
            values = [cris["crash_id"], cris["unit_nbr"], cris["prsn_nbr"], cris["prsn_type_id"], cris["prsn_occpnt_pos_id"]]
            if public is None:
                print("Public is empty for this person!")            
                # we have a person in CRIS that is not in the old VZDB
                keys = ["crash_id", "unit_nbr", "prsn_nbr", "prsn_type_id", "prsn_occpnt_pos_id"]
                values = [cris["crash_id"], cris["unit_nbr"], cris["prsn_nbr"], cris["prsn_type_id"], cris["prsn_occpnt_pos_id"]]
                print(f"Person {cris['crash_id']}, {cris['unit_nbr']}, {cris['prsn_nbr']}, {cris['prsn_type_id']}, {cris['prsn_occpnt_pos_id']} is missing from old VZ data")
            else:
                for k, v in cris.items():
                    if (k in ('crash_id', 'unit_nbr', 'prsn_nbr', 'prsn_type_id', 'prsn_occpnt_pos_id', 'years_of_life_lost')): # use to define fields to ignore
                        continue
                    if v != public[k]:
                        # print("Δ ", k, ": ", public[k], " → ", v)
                        keys.append(k)
                        values.append(public[k])
            comma_linefeed = ",\n            "
            sql = f"""
            insert into vz_facts.atd_txdot_person (
                {comma_linefeed.join(keys)}
            ) values (
                {comma_linefeed.join(values_for_sql(values))}
            );
            """
            # print(sql)
            try:
                vz_cursor.execute(sql)
                pg.commit()
            except:
                print("keys: ", keys)
                print("values: ", values)
                print("ERROR: ", sql)
            print("Inserted: crash_id: ", cris["crash_id"], "; Unit Number: ", cris["unit_nbr"], "; Person Number: ", cris["prsn_nbr"], "; Person Type ID: ", cris["prsn_type_id"], "; Person Occupant Position ID: ", cris["prsn_occpnt_pos_id"])
            # input("Press Enter to continue...")

def compute_for_primaryperson():
    with SshKeyTempDir() as key_directory:
        write_key_to_file(key_directory + "/id_ed25519", DB_BASTION_HOST_SSH_PRIVATE_KEY + "\n") 
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
            user=DB_USER,
            password=DB_PASS,
            dbname=DB_NAME,
            sslmode=DB_SSL_REQUIREMENT,
            sslrootcert="/root/rds-combined-ca-bundle.pem",
        )

        cris_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        public_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        vz_cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        vz_cursor.execute('truncate vz_facts.atd_txdot_primaryperson')
        pg.commit()

        # where crash_id = 17998493
        sql = """
        select * 
        from cris_facts.atd_txdot_primaryperson 
        order by crash_id asc, unit_nbr asc, prsn_nbr asc, prsn_type_id asc, prsn_occpnt_pos_id asc
        """
        cris_cursor.execute(sql)
        for cris in cris_cursor:
            print()
            print("Crash ID: ", cris["crash_id"], "; Unit Number: ", cris["unit_nbr"], "; Person Number: ", cris["prsn_nbr"], "; Person Type ID: ", cris["prsn_type_id"], "; Person Occupant Position ID: ", cris["prsn_occpnt_pos_id"])
            sql = "select * from production_fact_tables.atd_txdot_primaryperson where crash_id = %s and unit_nbr = %s and prsn_nbr = %s and prsn_type_id = %s and prsn_occpnt_pos_id = %s"
            public_cursor.execute(sql, (cris["crash_id"], cris["unit_nbr"], cris["prsn_nbr"], cris["prsn_type_id"], cris["prsn_occpnt_pos_id"] ))
            public = public_cursor.fetchone()
            keys = ["crash_id", "unit_nbr", "prsn_nbr", "prsn_type_id", "prsn_occpnt_pos_id"]
            values = [cris["crash_id"], cris["unit_nbr"], cris["prsn_nbr"], cris["prsn_type_id"], cris["prsn_occpnt_pos_id"]]
            if public is None:
                print("Public is empty for this primaryperson!")
                # we have a primaryperson in CRIS that is not in the old VZDB
                keys = ["crash_id", "unit_nbr", "prsn_nbr", "prsn_type_id", "prsn_occpnt_pos_id"]
                values = [cris["crash_id"], cris["unit_nbr"], cris["prsn_nbr"], cris["prsn_type_id"], cris["prsn_occpnt_pos_id"]]
                print(f"Primaryperson {cris['crash_id']}, {cris['unit_nbr']}, {cris['prsn_nbr']}, {cris['prsn_type_id']}, {cris['prsn_occpnt_pos_id']} is missing from old VZ data")

            else:
                for k, v in cris.items():
                    if (k in ('crash_id', 'unit_nbr', 'prsn_nbr', 'prsn_type_id', 'prsn_occpnt_pos_id', 'years_of_life_lost')): # use to define fields to ignore
                        continue
                    if v != public[k]:
                        # print("Δ ", k, ": ", public[k], " → ", v)
                        keys.append(k)
                        values.append(public[k])
            comma_linefeed = ",\n            "
            sql = f"""
            insert into vz_facts.atd_txdot_primaryperson (
                {comma_linefeed.join(keys)}
            ) values (
                {comma_linefeed.join(values_for_sql(values))}
            );
            """
            # print(sql)
            try:
                vz_cursor.execute(sql)
                pg.commit()
            except:
                print("keys: ", keys)
                print("values: ", values)
                print("ERROR: ", sql)
            print("Inserted: crash_id: ", cris["crash_id"], "; Unit Number: ", cris["unit_nbr"], "; Person Number: ", cris["prsn_nbr"], "; Person Type ID: ", cris["prsn_type_id"], "; Person Occupant Position ID: ", cris["prsn_occpnt_pos_id"])
            # input("Press Enter to continue...")



# these temp directories are used to store ssh keys, because they will
# automatically clean themselves up when they go out of scope.
class SshKeyTempDir:
    def __init__(self):
        self.path = None

    def __enter__(self):
        self.path = tempfile.mkdtemp(dir='/tmp')
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

