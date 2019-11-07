#
# For GraphQL and downloads we need requests and base64
#
import requests
import base64

from .config import ATD_ETL_CONFIG
from .request import run_query

#
# Helper functions
#

def download_cr3(crash_id, cookies):
    """
    Downloads a CR3 pdf from the CRIS website.
    :param crash_id: string - The crash id
    :param cookies: dict - A dictionary containing key=value pairs with cookie name and values.
    """
    crash_id_encoded = base64.b64encode(str("CrashId=" + crash_id).encode("utf-8")).decode("utf-8")
    url = ATD_ETL_CONFIG["ATD_CRIS_CR3_URL"] + crash_id_encoded
    resp = requests.get(url, allow_redirects=True, cookies=cookies)
    open(ATD_ETL_CONFIG["AWS_DOWNLOAD_PATH"] + "%s.pdf" % crash_id, 'wb').write(resp.content)


def get_crash_id_list(downloads_per_run="25"):
    """
    Downloads a list of crashes that do not have a CR3 associated.
    :return: dict - A json object with a list as returned from Hasura.
    """
    query_crashes_cr3 = """
        query CrashesWithoutCR3 {
          atd_txdot_crashes(
            limit: %s,
            where: {
              city_id: {_eq: 22}
              cr3_stored_flag: {_eq: "N"}
            }
          ) {
            crash_id
          }
        }
    """ % (str(downloads_per_run))

    return run_query(query_crashes_cr3)


def update_crash_id(crash_id):
    """
    Updates the status of a crash to having an available CR3 pdf in the S3 bucket.
    :param crash_id: string - The Crash ID that needs to be updated
    :return:
    """

    update_record_cr3 = """
        mutation CrashesUpdateRecordCR3 {
          update_atd_txdot_crashes(where: {crash_id: {_eq: %d}}, _set: {cr3_stored_flag: "Y", updated_by: "System"}) {
            affected_rows
          }
        }
    """ % crash_id
    return run_query(update_record_cr3)
