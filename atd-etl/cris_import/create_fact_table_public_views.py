#!/usr/bin/env python3

import os
import psycopg2
import psycopg2.extras

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


    # create_schema() # putting our read views in public
    make_crashes_view()
    #make_units_view()
    #make_person_view()
    #make_primaryperson_view()

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


def make_crashes_view():
    pg = get_pg_connection()
    db = pg.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    db.execute("drop view if exists public.atd_txdot_crashes;")
    pg.commit()

    # ldm.atd_txdot_crashes columns we want to compute on the fly
    # * latitude_primary
    # * longitude_primary
    
    sql = """
    with vz as (
        select
            'vz_facts' as schema, ordinal_position,
            column_name, data_type, udt_name, character_maximum_length, numeric_precision,
            numeric_precision, numeric_scale, is_generated, generation_expression, is_updatable
        FROM information_schema.columns
        WHERE true
            AND table_schema = 'vz_facts'
            AND table_name = 'atd_txdot_crashes'
        order by ordinal_position
        ), cris as (
        SELECT
            'cris' as schema, ordinal_position,
            column_name, data_type, udt_name, character_maximum_length, numeric_precision,
            numeric_precision, numeric_scale, is_generated, generation_expression, is_updatable
        FROM information_schema.columns
        WHERE true
            AND table_schema = 'cris_facts'
            AND table_name = 'atd_txdot_crashes'
        order by ordinal_position
        )
    select vz.column_name as vz_column_name, cris.column_name as cris_column_name,
        case when vz.column_name is not null then vz.schema
            when cris.column_name is not null then cris.schema
        end as schema,
        case when vz.column_name is not null then vz.column_name
            when cris.column_name is not null then cris.column_name
        end as column_name
    from vz
        full outer join cris on (vz.column_name = cris.column_name)
    where true 
        and (vz.column_name not in ('crash_id') or cris.column_name not in ('crash_id'))
    order by coalesce(vz.ordinal_position, cris.ordinal_position)
    """
    db.execute(sql)


    view = """
    create view public.atd_txdot_crashes as
        select
            cris_facts.atd_txdot_crashes.crash_id as crash_id,
        """
    columns = []
    for column in db:
        print("Column: ", column["vz_column_name"])
        if column["vz_column_name"] == "longitude_primary":
            columns.append("ST_X(COALESCE(vz_facts.atd_txdot_crashes.position, cris_facts.atd_txdot_crashes.position)) as longitude_primary")
        elif column["vz_column_name"] == "latitude_primary":
            columns.append("ST_Y(COALESCE(vz_facts.atd_txdot_crashes.position, cris_facts.atd_txdot_crashes.position)) as latitude_primary")
        elif column["vz_column_name"] == "last_update":
            definition = """
            case
                when 
                    vz_facts.atd_txdot_crashes.last_update is not null
                    and cris_facts.atd_txdot_crashes.last_update is not null
                    and vz_facts.atd_txdot_crashes.last_update > cris_facts.atd_txdot_crashes.last_update 
                        then vz_facts.atd_txdot_crashes.last_update
                when
                    vz_facts.atd_txdot_crashes.last_update is not null
                    and cris_facts.atd_txdot_crashes.last_update is not null
                    and vz_facts.atd_txdot_crashes.last_update < cris_facts.atd_txdot_crashes.last_update 
                        then cris_facts.atd_txdot_crashes.last_update
                else 
                    coalesce(vz_facts.atd_txdot_crashes.last_update, cris_facts.atd_txdot_crashes.last_update)
            end as last_update
            """ 
        elif column["vz_column_name"] == "last_update":
            definition = """
            case
                when 
                    vz_facts.atd_txdot_crashes.last_update is not null
                    and cris_facts.atd_txdot_crashes.last_update is not null
                    and vz_facts.atd_txdot_crashes.last_update > cris_facts.atd_txdot_crashes.last_update 
                        then vz_facts.atd_txdot_crashes.updated_by
                when
                    vz_facts.atd_txdot_crashes.last_update is not null
                    and cris_facts.atd_txdot_crashes.last_update is not null
                    and vz_facts.atd_txdot_crashes.last_update < cris_facts.atd_txdot_crashes.last_update 
                        then cris_facts.atd_txdot_crashes.updated_by
                else 
                    coalesce(vz_facts.atd_txdot_crashes.updated_by, cris_facts.atd_txdot_crashes.updated_by)
            end as updated_by
            """ 
            columns.append(definition)
        else:
            if column["vz_column_name"] is not None and column["cris_column_name"] is None:
                columns.append(f'vz_facts.atd_txdot_crashes.{column["column_name"]}')
            elif column["cris_column_name"] is not None and column["vz_column_name"] is None:
                columns.append(f'cris_facts.atd_txdot_crashes.{column["column_name"]}')
            else:
                columns.append(f'coalesce(vz_facts.atd_txdot_crashes.{column["column_name"]}, cris_facts.atd_txdot_crashes.{column["column_name"]}) as {column["column_name"]}')
    view = view + "    " + ", \n            ".join(columns)
    view = view + """
        from vz_facts.atd_txdot_crashes
        join cris_facts.atd_txdot_crashes
            on vz_facts.atd_txdot_crashes.crash_id = cris_facts.atd_txdot_crashes.crash_id
                """
    print(view)
    db.execute(view)
    pg.commit()

def make_units_view():
    pg = get_pg_connection()
    db = pg.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    db.execute("drop view if exists ldm.atd_txdot_units;")
    pg.commit()


    sql = """
    with vz as (
        select
            'vz' as schema, ordinal_position,
            column_name, data_type, udt_name, character_maximum_length, numeric_precision,
            numeric_precision, numeric_scale, is_generated, generation_expression, is_updatable
        FROM information_schema.columns
        WHERE true
            AND table_schema = 'vz'
            AND table_name = 'atd_txdot_units'
        order by ordinal_position
        ), cris as (
        SELECT
            'cris' as schema, ordinal_position,
            column_name, data_type, udt_name, character_maximum_length, numeric_precision,
            numeric_precision, numeric_scale, is_generated, generation_expression, is_updatable
        FROM information_schema.columns
        WHERE true
            AND table_schema = 'cris'
            AND table_name = 'atd_txdot_units'
        order by ordinal_position
        )
    select vz.column_name as vz_column_name, cris.column_name as cris_column_name,
        case when vz.column_name is not null then vz.schema
            when cris.column_name is not null then cris.schema
        end as schema,
        case when vz.column_name is not null then vz.column_name
            when cris.column_name is not null then cris.column_name
        end as column_name
    from vz
        full outer join cris on (vz.column_name = cris.column_name)
    where true 
        and (vz.column_name not in ('crash_id') or cris.column_name not in ('crash_id'))
    order by coalesce(vz.ordinal_position, cris.ordinal_position)
    """
    db.execute(sql)


    view = """
    create view ldm.atd_txdot_units as
        select
            cris.atd_txdot_units.crash_id as crash_id,
        """
    columns = []
    for column in db:
        if column["vz_column_name"] == "last_update":
            definition = """
            case
                when 
                    vz.atd_txdot_units.last_update is not null
                    and cris.atd_txdot_units.last_update is not null
                    and vz.atd_txdot_units.last_update > cris.atd_txdot_units.last_update 
                        then vz.atd_txdot_units.last_update
                when
                    vz.atd_txdot_units.last_update is not null
                    and cris.atd_txdot_units.last_update is not null
                    and vz.atd_txdot_units.last_update < cris.atd_txdot_units.last_update 
                        then cris.atd_txdot_units.last_update
                else 
                    coalesce(vz.atd_txdot_units.last_update, cris.atd_txdot_units.last_update)
            end as last_update
            """ 
        elif column["vz_column_name"] == "last_update":
            definition = """
            case
                when 
                    vz.atd_txdot_units.last_update is not null
                    and cris.atd_txdot_units.last_update is not null
                    and vz.atd_txdot_units.last_update > cris.atd_txdot_units.last_update 
                        then vz.atd_txdot_units.updated_by
                when
                    vz.atd_txdot_units.last_update is not null
                    and cris.atd_txdot_units.last_update is not null
                    and vz.atd_txdot_units.last_update < cris.atd_txdot_units.last_update 
                        then cris.atd_txdot_units.updated_by
                else 
                    coalesce(vz.atd_txdot_units.updated_by, cris.atd_txdot_units.updated_by)
            end as updated_by
            """ 
            columns.append(definition)
        elif column["vz_column_name"] is not None and column["cris_column_name"] is None:
            columns.append(f'vz.atd_txdot_units.{column["column_name"]}')
        elif column["cris_column_name"] is not None and column["vz_column_name"] is None:
            columns.append(f'cris.atd_txdot_units.{column["column_name"]}')
        else:
            columns.append(f'coalesce(vz.atd_txdot_units.{column["column_name"]}, cris.atd_txdot_units.{column["column_name"]}) as {column["column_name"]}')
    view = view + "    " + ", \n            ".join(columns)
    view = view + """
        from vz.atd_txdot_units
        join cris.atd_txdot_units
            on  (
                    vz.atd_txdot_units.crash_id = cris.atd_txdot_units.crash_id
                and vz.atd_txdot_units.unit_nbr = cris.atd_txdot_units.unit_nbr
                )
                """
    print(view)
    db.execute(view)
    pg.commit()


def make_person_view():
    pg = get_pg_connection()
    db = pg.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    db.execute("drop view if exists ldm.atd_txdot_person;")
    pg.commit()


    sql = """
    with vz as (
        select
            'vz' as schema, ordinal_position,
            column_name, data_type, udt_name, character_maximum_length, numeric_precision,
            numeric_precision, numeric_scale, is_generated, generation_expression, is_updatable
        FROM information_schema.columns
        WHERE true
            AND table_schema = 'vz'
            AND table_name = 'atd_txdot_person'
        order by ordinal_position
        ), cris as (
        SELECT
            'cris' as schema, ordinal_position,
            column_name, data_type, udt_name, character_maximum_length, numeric_precision,
            numeric_precision, numeric_scale, is_generated, generation_expression, is_updatable
        FROM information_schema.columns
        WHERE true
            AND table_schema = 'cris'
            AND table_name = 'atd_txdot_person'
        order by ordinal_position
        )
    select vz.column_name as vz_column_name, cris.column_name as cris_column_name,
        case when vz.column_name is not null then vz.schema
            when cris.column_name is not null then cris.schema
        end as schema,
        case when vz.column_name is not null then vz.column_name
            when cris.column_name is not null then cris.column_name
        end as column_name
    from vz
        full outer join cris on (vz.column_name = cris.column_name)
    where true 
        and (vz.column_name not in ('crash_id') or cris.column_name not in ('crash_id'))
    order by coalesce(vz.ordinal_position, cris.ordinal_position)
    """
    db.execute(sql)


    view = """
    create view ldm.atd_txdot_person as
        select
            cris.atd_txdot_person.crash_id as crash_id,
        """
    columns = []
    for column in db:
        if column["vz_column_name"] == "last_update":
            definition = """
            case
                when 
                    vz.atd_txdot_person.last_update is not null
                    and cris.atd_txdot_person.last_update is not null
                    and vz.atd_txdot_person.last_update > cris.atd_txdot_person.last_update 
                        then vz.atd_txdot_person.last_update
                when
                    vz.atd_txdot_person.last_update is not null
                    and cris.atd_txdot_person.last_update is not null
                    and vz.atd_txdot_person.last_update < cris.atd_txdot_person.last_update 
                        then cris.atd_txdot_person.last_update
                else 
                    coalesce(vz.atd_txdot_person.last_update, cris.atd_txdot_person.last_update)
            end as last_update
            """ 
        elif column["vz_column_name"] == "last_update":
            definition = """
            case
                when 
                    vz.atd_txdot_person.last_update is not null
                    and cris.atd_txdot_person.last_update is not null
                    and vz.atd_txdot_person.last_update > cris.atd_txdot_person.last_update 
                        then vz.atd_txdot_person.updated_by
                when
                    vz.atd_txdot_person.last_update is not null
                    and cris.atd_txdot_person.last_update is not null
                    and vz.atd_txdot_person.last_update < cris.atd_txdot_person.last_update 
                        then cris.atd_txdot_person.updated_by
                else 
                    coalesce(vz.atd_txdot_person.updated_by, cris.atd_txdot_person.updated_by)
            end as updated_by
            """ 
            columns.append(definition)
        elif column["vz_column_name"] is not None and column["cris_column_name"] is None:
            columns.append(f'vz.atd_txdot_person.{column["column_name"]}')
        elif column["cris_column_name"] is not None and column["vz_column_name"] is None:
            columns.append(f'cris.atd_txdot_person.{column["column_name"]}')
        else:
            columns.append(f'coalesce(vz.atd_txdot_person.{column["column_name"]}, cris.atd_txdot_person.{column["column_name"]}) as {column["column_name"]}')
    view = view + "    " + ", \n            ".join(columns)
    view = view + """
        from vz.atd_txdot_person
        join cris.atd_txdot_person
            on  (
                vz.atd_txdot_person.crash_id = cris.atd_txdot_person.crash_id
                and vz.atd_txdot_person.unit_nbr = cris.atd_txdot_person.unit_nbr
                and vz.atd_txdot_person.prsn_nbr = cris.atd_txdot_person.prsn_nbr
                and vz.atd_txdot_person.prsn_type_id = cris.atd_txdot_person.prsn_type_id
                and vz.atd_txdot_person.prsn_occpnt_pos_id = cris.atd_txdot_person.prsn_occpnt_pos_id
                )
                """
    print(view)
    db.execute(view)
    pg.commit()


def make_primaryperson_view():
    pg = get_pg_connection()
    db = pg.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    db.execute("drop view if exists ldm.atd_txdot_primaryperson;")
    pg.commit()


    sql = """
    with vz as (
        select
            'vz' as schema, ordinal_position,
            column_name, data_type, udt_name, character_maximum_length, numeric_precision,
            numeric_precision, numeric_scale, is_generated, generation_expression, is_updatable
        FROM information_schema.columns
        WHERE true
            AND table_schema = 'vz'
            AND table_name = 'atd_txdot_primaryperson'
        order by ordinal_position
        ), cris as (
        SELECT
            'cris' as schema, ordinal_position,
            column_name, data_type, udt_name, character_maximum_length, numeric_precision,
            numeric_precision, numeric_scale, is_generated, generation_expression, is_updatable
        FROM information_schema.columns
        WHERE true
            AND table_schema = 'cris'
            AND table_name = 'atd_txdot_primaryperson'
        order by ordinal_position
        )
    select vz.column_name as vz_column_name, cris.column_name as cris_column_name,
        case when vz.column_name is not null then vz.schema
            when cris.column_name is not null then cris.schema
        end as schema,
        case when vz.column_name is not null then vz.column_name
            when cris.column_name is not null then cris.column_name
        end as column_name
    from vz
        full outer join cris on (vz.column_name = cris.column_name)
    where true 
        and (vz.column_name not in ('crash_id') or cris.column_name not in ('crash_id'))
    order by coalesce(vz.ordinal_position, cris.ordinal_position)
    """
    db.execute(sql)


    view = """
    create view ldm.atd_txdot_primaryperson as
        select
            cris.atd_txdot_primaryperson.crash_id as crash_id,
        """
    columns = []
    for column in db:
        if column["vz_column_name"] is not None and column["cris_column_name"] is None:
            columns.append(f'vz.atd_txdot_primaryperson.{column["column_name"]}')
        elif column["cris_column_name"] is not None and column["vz_column_name"] is None:
            columns.append(f'cris.atd_txdot_primaryperson.{column["column_name"]}')
        else:
            columns.append(f'coalesce(vz.atd_txdot_primaryperson.{column["column_name"]}, cris.atd_txdot_primaryperson.{column["column_name"]}) as {column["column_name"]}')
    view = view + "    " + ", \n            ".join(columns)
    view = view + """
        from vz.atd_txdot_primaryperson
        join cris.atd_txdot_primaryperson
            on  (
                vz.atd_txdot_primaryperson.crash_id = cris.atd_txdot_primaryperson.crash_id
                and vz.atd_txdot_primaryperson.unit_nbr = cris.atd_txdot_primaryperson.unit_nbr
                and vz.atd_txdot_primaryperson.prsn_nbr = cris.atd_txdot_primaryperson.prsn_nbr
                and vz.atd_txdot_primaryperson.prsn_type_id = cris.atd_txdot_primaryperson.prsn_type_id
                and vz.atd_txdot_primaryperson.prsn_occpnt_pos_id = cris.atd_txdot_primaryperson.prsn_occpnt_pos_id
                )
                """
    print(view)
    db.execute(view)
    pg.commit()

def create_schema():
    pg = get_pg_connection()
    db = pg.cursor(cursor_factory=psycopg2.extras.DictCursor)

    db.execute("DROP SCHEMA IF EXISTS ldm CASCADE;")
    pg.commit()

    db.execute("CREATE SCHEMA IF NOT EXISTS ldm;")
    pg.commit()

    db.close()
    pg.close()

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


if __name__ == "__main__":
    main()