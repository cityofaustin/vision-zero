from sshtunnel import SSHTunnelForwarder
from .sshkeytempdir import SshKeyTempDir, write_key_to_file
import psycopg2
import psycopg2.extras

# usage: stick the "mess with in coming records" function in cris_import.py like
# so to make every record in the CRIS zip an update.

            #trimmed_token = remove_trailing_carriage_returns(pgloader_command_files)
            #typed_token = align_db_typing(trimmed_token)
            #typed_token = mess_with_incoming_records_to_ensure_updates(
                #typed_token,
                #DB_BASTION_HOST_SSH_PRIVATE_KEY,
                #DB_BASTION_HOST,
                #DB_BASTION_HOST_SSH_USERNAME,
                #DB_RDS_HOST,
                #DB_USER,
                #DB_PASS,
                #DB_NAME,
                #DB_SSL_REQUIREMENT,
            #)  
            #align_records_token = align_records(typed_token)
            #clean_up_import_schema(align_records_token)



def mess_with_incoming_records_to_ensure_updates(
    map_state,
    DB_BASTION_HOST_SSH_PRIVATE_KEY,
    DB_BASTION_HOST,
    DB_BASTION_HOST_SSH_USERNAME,
    DB_RDS_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME,
    DB_SSL_REQUIREMENT,
):
    print(map_state)
    schema = map_state["import_schema"]
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
            user=DB_USER,
            password=DB_PASS,
            dbname=DB_NAME,
            sslmode=DB_SSL_REQUIREMENT,
            sslrootcert="/root/rds-combined-ca-bundle.pem",
        )

        sql = f"""UPDATE {schema}.crash
            SET rpt_street_name = rpt_street_name || ' ' || lpad(to_hex((floor(random() * 16777215)::int)), 6, '0');
            """
        print(sql)
        cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(sql)

        sql = f"""UPDATE {schema}.unit
            SET vin = vin || ' ' || lpad(to_hex((floor(random() * 16777215)::int)), 6, '0');
            """
        print(sql)
        cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(sql)

        sql = f"""UPDATE {schema}.person
            SET prsn_last_name = prsn_last_name || ' ' || lpad(to_hex((floor(random() * 16777215)::int)), 6, '0');
            """
        print(sql)
        cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(sql)

        sql = f"""UPDATE {schema}.primaryperson
            SET prsn_last_name = prsn_last_name || ' ' || lpad(to_hex((floor(random() * 16777215)::int)), 6, '0');
            """
        print(sql)
        cursor = pg.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(sql)

        pg.commit()

    return map_state
