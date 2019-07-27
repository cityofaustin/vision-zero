import psycopg2
import ssl
import os

from process_config import *

def run_query(sql):
    """
    Connects to the database as specified in ATD_CRIS_DATABASE_CONFIG,
    then runs the query in the sql string, and returns all the records.
    """
    records = None
    try:
        connection = psycopg2.connect(
            host = ATD_CRIS_DATABASE_CONFIG['host'],
            port = ATD_CRIS_DATABASE_CONFIG['port'],
            user = ATD_CRIS_DATABASE_CONFIG['user'],
            password = ATD_CRIS_DATABASE_CONFIG['pass'],
            sslmode = ATD_CRIS_DATABASE_CONFIG['sslmode'],
            sslrootcert = ATD_CRIS_DATABASE_CONFIG['sslrootcert'],
            database = ATD_CRIS_DATABASE_CONFIG['database']
        )
        cursor = connection.cursor()

        cursor.execute(sql)
        print("run_query() Selecting rows from mobile table using cursor.fetchall")
        records = cursor.fetchall() 

    except (Exception, psycopg2.Error) as error :
        print ("run_query() Error while fetching data from PostgreSQL", error)
    finally:
        # Closing database connection.
        if(connection):
            cursor.close()
            connection.close()
            print("run_query() PostgreSQL connection is closed")
        return records


