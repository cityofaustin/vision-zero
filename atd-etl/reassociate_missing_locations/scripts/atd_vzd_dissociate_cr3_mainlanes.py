import json
import os
import requests
import time


def make_update() -> dict:
    """
    Runs a SQL query against Hasura and tries to dissociate the location
    for any CR3 crashes that fall in the main-lane polygon.
    :return dict:
    """
    response = requests.post(
        url=os.getenv("HASURA_ENDPOINT"),
        headers={
            "Accept": "*/*",
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_KEY")
        },
        json={
            "type": "run_sql",
            "args": {
                "sql": """
                    /*
                        This SQL query should dissociate any mainlane CR3 from their current location.
                    */
                    UPDATE atd_txdot_crashes
                    SET location_id = NULL,
                          updated_by  = 'System'
                    WHERE crash_id IN (
                        SELECT atc.crash_id
                        FROM atd_txdot_crashes AS atc
                                INNER JOIN cr3_mainlanes AS cr3m ON (
                                atc.position && cr3m.geometry
                                AND ST_Contains(
                                        ST_Transform(ST_Buffer(ST_Transform(cr3m.geometry, 2277), 1, 'endcap=flat join=round'),
                                                     4326), /* transform into 2277 to buffer by a foot, not a degree */
                                        atc.position)
                            )
                        WHERE 1 = 1
                          AND location_id IS NOT NULL
                    );
                """
            }
        }
    )
    response.encoding = "utf-8"
    return response.json()


def main():
    endpoint = os.getenv("HASURA_ENDPOINT")
    print("Dissociating CR3 records in the database")
    print(f"Hasura Endpoint: {endpoint}")
    print(f"Please wait, this could take a minute or two.")
    start = time.time()

    try:
        response = make_update()
    except Exception as e:
        response = {
            "errors": str(e)
        }

    response = json.dumps(response)
    print("Response: ")
    print(response)
    if "errors" in response:
        print("Error detected, exiting...")
        exit(1)

    # Stop timer and print duration
    end = time.time()
    hours, rem = divmod(end - start, 3600)
    minutes, seconds = divmod(rem, 60)
    print("Finished in: {:0>2}:{:0>2}:{:05.2f}".format(int(hours), int(minutes), seconds))


if __name__ == "__main__":
    main()
