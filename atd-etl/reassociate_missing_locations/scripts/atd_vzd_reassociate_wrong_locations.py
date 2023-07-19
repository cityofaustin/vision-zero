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
                        This query reassociates any locations that belong in the wrong location_id
                    */
                    UPDATE
                        atd_txdot_crashes
                    SET
                        location_id = find_location_id_for_cr3_collision(crash_id),
                        updated_by = 'SYSTEM'
                    WHERE
                      crash_id IN (
                        SELECT
                            DISTINCT (atc.crash_id)
                        FROM atd_txdot_crashes AS atc
                            LEFT OUTER JOIN find_location_for_cr3_collision(atc.crash_id) AS loc ON TRUE
                        WHERE 1=1
                            AND atc.location_id IS NOT NULL
                            AND (atc.austin_full_purpose = 'Y' OR (atc.city_id = 22 AND atc.position IS NULL))
                            AND atc.location_id != loc.location_id
                     );
                """
            }
        }
    )
    response.encoding = "utf-8"
    return response.json()


def main():
    endpoint = os.getenv("HASURA_ENDPOINT")
    print("Reassociating incorrect location_id for CR3 records in the database")
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
