"""
Prob make a view like this?
SELECT
    crashes.id,
    crashes.record_locator,
    crashes.address_display,
    crashes.crash_timestamp,
    cris.latitude,
    cris.longitude,
    crashes.latitude,
    crashes.longitude,
    clv.crash_injry_sev_id
FROM
    crashes
    LEFT JOIN crashes_cris cris ON cris.id = crashes.id
    LEFT JOIN crashes_list_view clv ON clv.id = crashes.id
WHERE
    crashes.investigat_agency_id = 74
    AND crashes.latitude IS NULL
    AND crashes.private_dr_fl = FALSE;
"""

#!/usr/bin/env python
import logging

from rapidfuzz import fuzz

from utils.graphql import (
    make_hasura_request,
    GET_UNMATCHED_EMS_PCRS_TO_CRASHES,
    GET_EMS_PCRS_BY_INCIDENT_NUMBER,
    GET_CRASH_BY_APD_CASE_ID,
    UPDATE_EMS_PCRs_BY_INCIDENT_NUMBER,
)
from utils.logging import get_logger


# todo—we can do this with non-cr3s!
def main():
    # get all PCRs that are not matched to a crash
    logger.info("Getting EMS PCRs to match...")
    ems_pcrs_data = make_hasura_request(query=GET_UNMATCHED_EMS_PCRS_TO_CRASHES)
    ems_pcrs = ems_pcrs_data["ems__incidents"]
    # group by incident_number
    inc_nums_todo = []
    for pcr in ems_pcrs:
        inc_num = pcr["incident_number"]
        if inc_num not in inc_nums_todo:
            inc_nums_todo.append(inc_num)

    logger.info(f"{len(ems_pcrs)} pcrs from {len(inc_nums_todo)} incidents to process")

    for inc_num in inc_nums_todo:
        # get all PCRs with this incident number (some of which may already be matched)
        pcrs = make_hasura_request(
            query=GET_EMS_PCRS_BY_INCIDENT_NUMBER,
            variables={"incident_number": inc_num},
        )["ems__incidents"]

        """
        Make sure all PCRs have the same crash_pk. it is an edge case but it is
        possible that not all PCRs are matched to the same crash. ignore these and
        leave them for manual review
        """
        if any([pcr["crash_pk"] for pcr in pcrs]):
            # other PCRS are already matched
            # todo: deal with this
            logger.info(
                f"Skipping incident {inc_num} because some PCRs are already matched"
            )
            continue

        # get case IDs from all PCRs - it is an edge case that some pcrs with the same
        # incident number have differing apd_incident_numbers
        apd_case_ids = list(
            set(
                case_id
                for pcr in pcrs
                if pcr["apd_incident_numbers"]
                for case_id in pcr["apd_incident_numbers"]
            )
        )

        pcr_address = pcrs[0]["incident_location_address"]

        if not pcr_address:
            # has never happened but ok
            continue

        matched_crashes = []
        for case_id in apd_case_ids:
            crashes = make_hasura_request(
                query=GET_CRASH_BY_APD_CASE_ID, variables={"case_id": str(case_id)}
            )["crashes"]
            if not crashes:
                continue

            for crash in crashes:
                crash_address = crash["address_display"]

                ratio = fuzz.ratio(pcr_address.lower(), crash_address.lower())
                token_sort_ratio = fuzz.token_sort_ratio(
                    pcr_address.lower(), crash_address.lower()
                )
                partial_token_sort_ratio = fuzz.partial_token_sort_ratio(
                    pcr_address.lower(), crash_address.lower()
                )

                if token_sort_ratio > 75:
                    print(f"{pcr_address} :::: {crash_address}")
                    print(
                        int(ratio), int(token_sort_ratio), int(partial_token_sort_ratio)
                    )
                    matched_crashes.append(
                        {
                            "id": crash["id"],
                            "record_locator": crash["record_locator"],
                            "token_sort_ratio": token_sort_ratio,
                            "address": f"{pcr_address} :::: {crash_address}",
                        }
                    )
        if len(matched_crashes) > 1:
            # todo: anything?
            continue

        print(f"Updating incident {inc_num}")
        if len(matched_crashes) == 0:
            updates = {
                "crash_match_status": "unmatched_by_automation",
                "updated_by": "special_new_etl_yay_unmatched",
            }
            make_hasura_request(
                query=UPDATE_EMS_PCRs_BY_INCIDENT_NUMBER,
                variables={"incident_number": inc_num, "updates": updates},
            )

        else:
            updates = {
                "crash_pk": matched_crashes[0]["id"],
                "crash_match_status": "matched_by_automation",
                "updated_by": "special_new_etl_yay",
                "_match_event_name": "match_crash_by_automation",
            }
            make_hasura_request(
                query=UPDATE_EMS_PCRs_BY_INCIDENT_NUMBER,
                variables={"incident_number": inc_num, "updates": updates},
            )


if __name__ == "__main__":
    logger = get_logger("match_ems_to_people", logging.INFO)
    main()
