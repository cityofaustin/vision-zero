import requests
import os
import json
from process_config import *
from process_pg import *

ATD_HERE_API_ENDPOINT="https://geocoder.api.here.com/6.2/geocode.json"

def get_array_item(array, index):
    try:
        value = array[index]
        return "" if value is None else value.strip()
    except:
        return ""


# Loop:
#   Until there aren't any more results:
#       1. Gather data from PostgreSQL (any records without lat-longs), limit to 10 records.
#       2. For each record:
#           - Check if the row has an address.
#           - GeoCode the address
#           - If there is GeoCode data, then make update to record in PostgreSQL

sql_query = """
    SELECT
           t.crash_id,
           (
               CASE
                   -- If neither address is empty, return primary
                   WHEN (t.ADDR_PRIM <> '' AND t.ADDR_SEC <> '') THEN t.ADDR_PRIM
                   -- If both addresses are empty, return empty string
                   WHEN (t.ADDR_PRIM = '' AND t.ADDR_SEC = '') THEN ''
                   -- If Primary is empty, return secondary
                   WHEN (t.ADDR_PRIM = '') THEN t.ADDR_SEC
                   -- If Secondar is empty, return primary
                   WHEN (t.ADDR_SEC = '') THEN t.ADDR_PRIM
               END
           ) AS ADDRESS
    FROM(
        SELECT
            crash_id,
            -- Give me the full primary address or give me nothing
            (CASE WHEN (rpt_block_num is not null AND rpt_street_name is not null AND rpt_street_name NOT LIKE '%NOT REPORTED%') THEN concat(rpt_block_num, ' ', rpt_street_name) ELSE '' END) AS ADDR_PRIM,
            -- Give me the full secondary address or give me nothing
            (CASE WHEN (rpt_sec_block_num is not null AND rpt_sec_street_name is not null AND rpt_sec_street_name NOT LIKE '%NOT REPORTED%') THEN concat(rpt_sec_block_num, ' ', rpt_sec_street_name) ELSE '' END) AS ADDR_SEC
        FROM atd_txdot_crashes
        WHERE
              1=1
              AND city_id = 22
              AND (latitude IS NULL OR longitude IS NULL)
              -- It has a primary or secondary address
              AND ( -- The primary address must be actionable (block number and street name)
                (rpt_block_num is not null AND rpt_street_name is not null AND rpt_street_name NOT LIKE '%NOT REPORTED%')
                OR -- the secondary address is workable
                (rpt_sec_block_num is not null AND rpt_sec_street_name is not null AND rpt_street_name NOT LIKE '%NOT REPORTED%')
            )
    ) as t LIMIT 10;
"""




try:
    pg_connection = build_connection()
    pg_cursor = build_cursor(pg_connection)
except Exception as e:
    print("Closing script, problem with PostgreSQL: " + str(e))
    exit(1)

# We will need some loop control variables
errors = []
current_iteration = 0
stop_at_iteration = 1

# Instantiate a permanent loop
while True:
    records = None
    try:
        pg_cursor.execute(sql_query)
        records = pg_cursor.fetchall()
    except Exception as e:
        print("Problem with previous query: " + str(e))
        break

    # Stop whenever records is empty...
    if len(records) == 0:
        break

    # Increment current iteration
    current_iteration += 1

    # Break if we have reached the value in stop_at_iteration
    if stop_at_iteration > 0 and current_iteration > stop_at_iteration:
        print("We have reached the end of the specified iteration line, closing loop.")
        break

    # Now for each of our records we are going to print them...
    for row in records:
        print("\n\n")
        # Build our address
        record_id = row[0]
        address = row[1]

        # Build our parameters
        parameters = {
            "app_id": os.getenv("ATD_CRIS_HERE_APP_ID"),
            "app_code": os.getenv("ATD_CRIS_HERE_APP_CODE"),
            "searchtext": address
        }

        try:

            # Make request to API Endpoint
            request = requests.get(ATD_HERE_API_ENDPOINT, params=parameters)
            coordinates = request.json()['Response']['View'][0]['Result'][0]['Location']['DisplayPosition']

            sql_update = "UPDATE %s SET geocoded = 'Y', geocode_status = '%s', latitude = %f, longitude = %f WHERE crash_id = %i;" % \
            (ATD_CRIS_DATABASE_TABLES['crashes'], 'SUCCESS', coordinates['Latitude'], coordinates['Longitude'], row[0])

        except Exception as e:
            sql_update = "UPDATE %s SET geocoded = 'N', geocode_status = '%s' WHERE crash_id = %i;" % \
                         (ATD_CRIS_DATABASE_TABLES['crashes'], 'FAILED', row[0])

            print("Failed to geocode for '%s', error: %s" %(address, str(e)))

        print(sql_update)
        pg_cursor.execute(sql_update)


# Close our open connections and open cursors
if pg_connection:
    pg_cursor.close()
    pg_connection.close()
    print("PostgreSQL connection is closed")


# Report errors
print("\n\nTotal Errors: " + str(len(errors)))
for crash_id in errors:
    print("Error Crash_ID: " + str(crash_id))