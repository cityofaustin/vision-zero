from openpyxl import load_workbook
import re
import json
import os
import psycopg2
import psycopg2.extras
import onepasswordconnectsdk
from sshtunnel import SSHTunnelForwarder
from onepasswordconnectsdk.client import Client, new_client
import tempfile
import shutil
import time

from lib.lookup_map import crash_lookup_map, unit_lookup_map, person_lookup_map, primaryperson_lookup_map

DEPLOYMENT_ENVIRONMENT = os.environ.get(
    "ENVIRONMENT", "development"
)  # our current environment from ['production', 'development']
ONEPASSWORD_CONNECT_TOKEN = os.getenv("OP_API_TOKEN")  # our secret to get secrets 🤐
ONEPASSWORD_CONNECT_HOST = os.getenv("OP_CONNECT")  # where we get our secrets
VAULT_ID = os.getenv("OP_VAULT_ID")


def main():
    global DB_HOST
    global DB_USER
    global DB_PASS
    global DB_NAME
    global DB_SSL_REQUIREMENT

    global DB_BASTION_HOST_SSH_USERNAME
    global DB_BASTION_HOST_SSH_PRIVATE_KEY
    global DB_BASTION_HOST
    global DB_RDS_HOST

    secrets = get_secrets()

    DB_HOST = secrets["database_host"]
    DB_USER = secrets["database_username"]
    DB_PASS = secrets["database_password"]
    DB_NAME = secrets["database_name"]
    DB_SSL_REQUIREMENT = secrets["database_ssl_policy"]

    DB_BASTION_HOST_SSH_USERNAME = secrets["bastion_ssh_username"]
    DB_BASTION_HOST_SSH_PRIVATE_KEY = secrets["bastion_ssh_private_key"]
    DB_BASTION_HOST = secrets["bastion_host"]
    DB_RDS_HOST = secrets["database_host"]

    print("DB_BASTION_HOST: ", DB_BASTION_HOST)

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

        tables = [
            {
                'imported_table': 'atd_txdot_crashes',
                'id_columns': ['crash_id'],
                'lookup_map': crash_lookup_map
            },
            {
                'imported_table': 'atd_txdot_units',
                'id_columns': ['crash_id', 'unit_nbr'],
                'lookup_map': unit_lookup_map
            },
            {
                'imported_table': 'atd_txdot_person',
                'id_columns': ['crash_id', 'unit_nbr', 'prsn_nbr'],
                'lookup_map': person_lookup_map
            },
            {
                'imported_table': 'atd_txdot_primaryperson', 
                'id_columns': ['crash_id', 'unit_nbr', 'prsn_nbr'],
                'lookup_map': primaryperson_lookup_map
            },
        ]


        # build up the query and run it
        for table in tables:
            for field in table['lookup_map']:

                #if not field["field_name"] == 'hwy_dsgn_lane_id':
                    #continue

                # 👇 Workaround for `character` as `integer` datatype in VZDB crashes tables
                
                character_not_integer_fields = ('hwy_dsgn_lane_id', 'hwy_dsgn_hrt_id', 'base_type_id', 'surf_type_id')
                if field["field_name"] in character_not_integer_fields:
                    print("Field name:", field["field_name"])
                    print('Table:', table["imported_table"])

                    sql = f"""update production_fact_tables.{table["imported_table"]} set {field["field_name"]} = null 
                            where
                                    {field["field_name"]} = 'null'
                                or  {field["field_name"]} = ''
                            """

                    print(sql)
                    cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                    cursor.execute(sql)
                    pg.commit()
                    cursor.close()

                #if field["field_name"] == 'hwy_dsgn_lane_id':
                    #sql = """update production_fact_tables.atd_txdot_crashes set hwy_dsgn_lane_id = null 
                            #where
                                    #hwy_dsgn_lane_id = 'null'
                                #or  hwy_dsgn_lane_id = ''
                            #"""
                    #cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                    #cursor.execute(sql)
                    #pg.commit()
                    #cursor.close()
                
                #if field["field_name"] == 'hwy_dsgn_hrt_id':
                    #sql = """update production_fact_tables.atd_txdot_crashes set hwy_dsgn_hrt_id = null 
                            #where
                                    #hwy_dsgn_hrt_id = 'null'
                                #or  hwy_dsgn_hrt_id = ''
                            #"""
                    #cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                    #cursor.execute(sql)
                    #pg.commit()
                    #cursor.close()

                sql = f"update production_fact_tables.{table['imported_table']} set "
                assignments = []
                if field["lookup_table"] is not None:
                    assignments.append(f"""
                        {field["field_name"]} = (
                            select id
                            from public.{field["lookup_table"]}
                            where true 
                                and source = 'cris'
                                and cris_id = production_fact_tables.{table["imported_table"]}.{field["field_name"]}::integer
                            )""")
                if len(assignments) > 0:
                    sql += ", ".join(assignments)  + "\n"
                    sql += f" where production_fact_tables.{table['imported_table']}.{field['field_name']} is not null"

                    print(sql)

                    cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                    cursor.execute(sql)
                    pg.commit()
                    cursor.close()



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
