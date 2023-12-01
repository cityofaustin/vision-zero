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
                        This script changes the flag cr3_stored_flag to N only
                        if it is a temporary record and it currently has the cr3_stored_flag = 'Y
                    */
                    UPDATE atd_txdot_crashes
                    SET cr3_stored_flag = 'N'
                    WHERE crash_id IN (
                        SELECT crash_id
                        FROM atd_txdot_crashes
                        WHERE 1 = 1
                          AND temp_record = true
                          AND cr3_stored_flag = 'Y'
                    );
                """
            }
        }
    )
    response.encoding = "utf-8"
    return response.json()


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
