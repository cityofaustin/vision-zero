"""Gets a list of crash ids we have CR3 PDFs for in our AWS S3 bucket and checks them against crashes in the atd_txdot_crashes table where cr3_stored_flag = 'Y'.
Updates cr3_stored_flag to 'N' if those crash IDs aren't in the list of CR3s we have.
"""

import argparse
import requests
import subprocess

from env import HASURA_AUTH

CRASHES_QUERY = """
  query QueryCrashes {
    atd_txdot_crashes(
      where: { cr3_stored_flag: { _eq: "Y" } }
    ) {
      crash_id
    }
  }
"""

CRASHES_UPDATE = """
  mutation UpdateCrash(
    $crash_id: Int!,
  ) {
    update_atd_txdot_crashes_by_pk(
        pk_columns: { crash_id: $crash_id },
        _set: { cr3_stored_flag: "N" }
    ) {
        crash_id
    }
  }
"""


def get_s3_cr3_files():
    """Connect to the aws s3 bucket and get all of the names of the cr3 pdfs we have
    and pipe them into a new file in this directory.
    """
    # Creates a new txt file in the current directory to store output from the following commands
    subprocess.run(["touch", "s3_cr3_file_names.txt"])
    s3_cr3_file_names = open("s3_cr3_file_names.txt", "w")
    print(
        "Writing names of cr3 pdfs we have in s3 to a new file in this directory called 's3_cr3_file_names.txt', this can take a few minutes..."
    )
    aws = subprocess.Popen(
        ["aws", "s3", "ls", "s3://atd-vision-zero-editor/production/cris-cr3-files/"],
        stdout=subprocess.PIPE,
    )
    output = subprocess.Popen(
        ["awk", "{print $4}"], stdin=aws.stdout, stdout=s3_cr3_file_names
    )
    output.wait()


def read_s3_cr3s_file_into_list():
    """Read the contents of the s3 cr3 file and line by line remove the pdf extension
    and append the crash id to a list.
    """
    crashes_with_cr3s = []
    with open("s3_cr3_file_names.txt") as cr3s_file:
        crashes_with_cr3s = [line.rstrip().removesuffix(".pdf") for line in cr3s_file]
    return crashes_with_cr3s


def find_crashes_with_wrong_flag(crashes_with_cr3_flag, crashes_with_cr3s):
    """Finds crash ids that we don't have cr3s for but have cr3_stored_flag = 'Y'."""
    crashes_with_cr3_flag_list = []
    for crash in crashes_with_cr3_flag:
        crashes_with_cr3_flag_list.append(str(crash["crash_id"]))
    crashes_to_update = list(set(crashes_with_cr3_flag_list) - set(crashes_with_cr3s))
    return crashes_to_update


def make_hasura_request(*, query, variables, env):
    """Fetch data from hasura
    Args:
      query (str): the hasura query
      env (str): the environment name, which will be used to acces secrets
    Raises:
      ValueError: If no data is returned
    Returns:
      dict: Hasura JSON response data
    """
    # If running for a local env you can comment out the admin_secret lines
    admin_secret = HASURA_AUTH["hasura_graphql_admin_secret"][env]
    endpoint = HASURA_AUTH["hasura_graphql_endpoint"][env]
    headers = {
        "X-Hasura-Admin-Secret": admin_secret,
        "content-type": "application/json",
    }
    payload = {"query": query, "variables": variables}
    res = requests.post(endpoint, json=payload, headers=headers)
    res.raise_for_status()
    data = res.json()
    try:
        return data["data"]
    except KeyError:
        raise ValueError(data)


def main(env):
    get_s3_cr3_files()

    crashes_with_cr3s = read_s3_cr3s_file_into_list()

    print("We have CR3 PDFs for", len(crashes_with_cr3s), "crashes.")

    crashes_with_cr3_flag = make_hasura_request(
        query=CRASHES_QUERY, env=env, variables={}
    )

    crashes_to_update = find_crashes_with_wrong_flag(
        crashes_with_cr3_flag["atd_txdot_crashes"], crashes_with_cr3s
    )

    print(
        "We need to update the cr3_stored_flag for", len(crashes_to_update), "crashes."
    )

    counts = 0

    # Update cr3_stored_flag to 'N' for crashes we dont actually have cr3s for
    for crash_id in crashes_to_update:
        crash_id = int(crash_id)
        print(crash_id)
        make_hasura_request(
            query=CRASHES_UPDATE,
            variables={"crash_id": crash_id},
            env=env,
        )
        counts += 1
        print(counts)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "-e",
        "--env",
        type=str,
        choices=["local", "staging", "prod"],
        default="staging",
        help=f"Environment",
    )

    args = parser.parse_args()

    main(args.env)
