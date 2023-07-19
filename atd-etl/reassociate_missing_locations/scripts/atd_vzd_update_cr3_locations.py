import json
import os
import requests
import time


def make_update() -> dict:
    """
    Runs a SQL query against Hasura and tries to assign a
    location to any Non-CR3s that do not have location yet.
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
                        The script looks for any CR3 crashes that should have a location associated
                        and that are not part of a main lane polygon.
                    */
                    UPDATE
                        atd_txdot_crashes
                    SET location_id = (SELECT location_id FROM find_location_for_cr3_collision(crash_id) LIMIT 1),
                        updated_by  = 'SYSTEM'
                    WHERE crash_id IN (
                        WITH atc AS (
                            /* Find any crashes that have:
                                - coordinates
                                - do not a location currently 
                                - should have one, since it is available
                            */
                            SELECT crash_id,
                                   position,
                                   location_id
                            FROM atd_txdot_crashes AS atc
                            WHERE 1 = 1
                              AND atc.position IS NOT NULL /* With coordinates */
                              AND atc.location_id IS NULL  /* Without a current location */
                              /* There is a location for it available */
                              AND (SELECT location_id FROM find_location_for_cr3_collision(atc.crash_id) LIMIT 1) IS NOT NULL
                        )
                        /* From that short list, determine which are main-lanes and exclude */
                        SELECT 
                            atc.crash_id /* We only need the crash id */
                        FROM atc
                                LEFT OUTER JOIN cr3_mainlanes AS cr3m ON (
                                atc.position && cr3m.geometry
                                AND ST_Contains(
                                        ST_Transform(
                                                ST_Buffer(
                                                        ST_Transform(cr3m.geometry, 2277),
                                                        1,
                                                        'endcap=flat join=round'
                                                    ), 4326
                                            ),
                                        atc.position
                                    )
                            )
                        /* Is not part of a main-lane */ 
                        WHERE (CASE WHEN cr3m.geometry IS NULL THEN false ELSE true END) IS FALSE
                    );
                """
            }
        }
    )
    response.encoding = "utf-8"
    if response.status_code == 200:
        return response.json()
    else:
        return {"errors": {"status_code": response.status_code, "reason": response.reason}}


def main():
    endpoint = os.getenv("HASURA_ENDPOINT")
    print("Updating non-cr3 records in the database")
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
