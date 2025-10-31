from itertools import groupby
import logging

from rapidfuzz import fuzz

from utils.exceptions import EMSPersonIdError

from utils.field_maps import (
    EMS_POS_IN_VEHICLE_TO_CRIS_OCC_POS_MAP,
    CRIS_MODE_CAT_TO_EMS_TRAVEL_MODE_MAP,
)
from utils.graphql import (
    make_hasura_request,
    GET_UNMATCHED_EMS_PCRS,
    GET_UNMATCHED_CRASH_PEOPLE,
    GET_EMS_PCRS_BY_INCIDENT_NUMBER,
    UPDATE_EMS_PCR,
)
from utils.logging import get_logger
from utils.match_rules import MATCH_RULES

AGE_GAP_TOLERANCE = 3
TRANSPORT_DEST_MATCH_MIN_MIN_SCORE = 90


def is_sex_match(pcr, person):
    if not person["gndr"] or not pcr["pcr_patient_gender"]:
        return False
    return person["gndr"]["label"].lower() == pcr["pcr_patient_gender"].lower()


def is_ethnicty_match(pcr, person):
    if not person["drvr_ethncty"] or not pcr["pcr_patient_race"]:
        return
    return (
        person["drvr_ethncty"]["label"].lower() in pcr["pcr_patient_race"].lower()
    ) or (
        "indian" in person["drvr_ethncty"]["label"].lower()
        and "indian" in pcr["pcr_patient_race"].lower()
    )


def is_age_match(pcr, person):
    if pcr["pcr_patient_age"] is None or person["prsn_age"] is None:
        return False
    return pcr["pcr_patient_age"] == person["prsn_age"]


def is_approx_age_match(pcr, person):
    if pcr["pcr_patient_age"] is None or person["prsn_age"] is None:
        return False
    return abs(pcr["pcr_patient_age"] - person["prsn_age"]) <= AGE_GAP_TOLERANCE


def is_position_in_vehicle_match(pcr, person):
    pcr_position = pcr["mvc_form_position_in_vehicle"]
    person_position = person.get("occpnt_pos", {}).get("label", "")
    if pcr_position and person_position:
        pcr_position = pcr_position.lower()
        person_position = person_position.lower()
        pcr_position_mapped = EMS_POS_IN_VEHICLE_TO_CRIS_OCC_POS_MAP.get(pcr_position)
        if pcr_position_mapped:
            return pcr_position_mapped == person_position
    return False


def is_mode_match(pcr, person):
    """
    Consider this query and inc 25257-0313, which highlights ped mode mismatches:
    SELECT
        incident_number,
        travel_mode,
        mode_desc
    FROM
        ems__incidents
        LEFT JOIN people_list_view ON people_list_view.id = person_id
    WHERE
        person_id IS NOT NULL
        AND travel_mode = 'Pedestrian'
        AND mode_desc != 'Pedestrian';
    """
    pcr_mode = pcr["travel_mode"]
    person_mode = person["mode_desc"]
    if pcr_mode and person_mode:
        pcr_mode = pcr_mode.lower()
        person_mode = person_mode.lower()
        person_mode_mapped = CRIS_MODE_CAT_TO_EMS_TRAVEL_MODE_MAP.get(person_mode)
        if person_mode_mapped:
            return pcr_mode == person_mode_mapped
    return False


def get_transport_dest_score(pcr, person):
    pcr_transport_dest = pcr["pcr_transport_destination"]
    person_transport_dest = person["prsn_taken_to"]
    if pcr_transport_dest and person_transport_dest:
        return fuzz.ratio(pcr_transport_dest.lower(), person_transport_dest.lower())
    return 0


def is_injury_severity_match(pcr, person):
    return pcr["patient_injry_sev_id"] == person["prsn_injry_sev_id"]


def get_unmatched_pcrs(match_results):
    """Return a list of all PCR records that have not been assigned a person_id"""
    return [pcr for pcr in match_results if not pcr["matched_person_id"]]


def is_person_id_matched(person_id, incident_match_results):
    """Check to see if a person_id is matched to any PCRs in an incident"""
    for pcr in incident_match_results:
        if pcr["matched_person_id"] == person_id:
            return True
    return False


def all_equal(iterable):
    """Check that all values in the iterable are equal
    h/t https://stackoverflow.com/questions/3844801/check-if-all-elements-in-a-list-are-equal
    """
    g = groupby(iterable)
    return next(g, True) and not next(g, False)


def compare_pcr_to_person(pcr, person):
    """Compare a PCR record to a person record and flag each potentially
     matching attribute as true/false.

     This function prepares an object when will be used later to assign
     people records to PCRs based on the match rules.

    Args:
        pcr (dict): an ems__incidents record, aka a patien care record
        person (dict): a CRIS person record

    Returns:
        dict: An object that holds the results of each attribute match test
    """
    person_match_result = {"id": person["id"]}
    person_match_result["sex"] = is_sex_match(pcr, person)
    person_match_result["ethnicity"] = is_ethnicty_match(pcr, person)
    person_match_result["age_approx"] = is_approx_age_match(pcr, person)
    person_match_result["age"] = is_age_match(pcr, person)
    person_match_result["pos_in_vehicle"] = is_position_in_vehicle_match(pcr, person)
    person_match_result["injury_severity"] = is_injury_severity_match(pcr, person)
    person_match_result["travel_mode"] = is_mode_match(pcr, person)
    person_match_result["transport_dest_score"] = get_transport_dest_score(pcr, person)
    person_match_result["transport_dest"] = (
        person_match_result["transport_dest_score"] > TRANSPORT_DEST_MATCH_MIN_MIN_SCORE
    )
    return person_match_result


def assign_people_to_pcrs(incident_match_results):
    """Assign person_id's to PCRs. This function applies our hierarchical
    matching rues to determine the PCR-person record match.

    It works by iterating through each ruleset and testing it against each
    PCR in the incident. The first rule that finds a match wins, preventing
    the same person from being matched to multiple PCRs. See also the
    MATCH_RULES docstring.

    Args:
        incident_match_results (list): A list of PCRs with person comparison
        results

    Returns:
        None: PCRs are updated in place with the matched person_id
    """
    for attr_set in MATCH_RULES:
        unmatched_pcrs = get_unmatched_pcrs(incident_match_results)
        if not unmatched_pcrs:
            # nothing left to do
            break
        for pcr in unmatched_pcrs:
            logger.debug(f"Checking PCR ID {pcr['id']} for matches")
            for person in pcr["possible_matching_people"]:
                if is_person_id_matched(person["id"], incident_match_results):
                    logger.debug(
                        f"Skipping person ID {person['id']} because it is are already matched"
                    )
                    continue
                if all(person[attr] for attr in attr_set):
                    # test passed — assign person_id
                    pcr["matched_person_id"] = person["id"]
                    pcr["person_match_attributes"] = attr_set
                    logger.debug(f"Matched PCR {pcr['id']} to person ID {person['id']}")
                    break
    return


def main():
    # get all PCRs that are matched to a crash_pk but not a person_id
    logger.info("Getting EMS PCRs to match...")
    ems_pcrs_data = make_hasura_request(query=GET_UNMATCHED_EMS_PCRS)
    ems_pcrs = ems_pcrs_data["ems__incidents"]
    # group by incident_number
    inc_nums_todo = []
    for pcr in ems_pcrs:
        inc_num = pcr["incident_number"]
        if inc_num not in inc_nums_todo:
            inc_nums_todo.append(inc_num)

    logger.info(f"{len(ems_pcrs)} pcrs from {len(inc_nums_todo)} incidents to process")

    all_match_results = []
    # attempt to match each PCR to a CRIS person record
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
        if not all_equal([pcr["crash_pk"] for pcr in pcrs]):
            # todo: need to manually fix the small number of these and decide how to handle going forward
            logger.info(
                f"Skipping incident {inc_num} because crash_pks are not uniform"
            )
            continue

        crash_pk = pcrs[0]["crash_pk"]

        pcrs_unmatched = [pcr for pcr in pcrs if not pcr["person_id"]]

        already_matched_people_ids = [
            pcr["person_id"] for pcr in pcrs if pcr["person_id"]
        ]

        # get all people records from the matched crash which are not already matched
        people_unmatched = make_hasura_request(
            query=GET_UNMATCHED_CRASH_PEOPLE,
            variables={"crash_pk": crash_pk, "matched_ids": already_matched_people_ids},
        )["people_list_view"]

        incident_match_results = []
        for pcr in pcrs_unmatched:
            pcr_comparison_result = {
                "id": pcr["id"],
                "incident_number": pcr["incident_number"],
                "possible_matching_people": [],
                "matched_person_id": None,
                "person_match_attributes": [],
            }

            if not people_unmatched:
                # nothing we can do, so append to match results so that
                # the record will be flagged as match not found
                incident_match_results.append(pcr_comparison_result)
                continue

            # compare the pcr to each person record and save results
            possible_matching_people = [
                compare_pcr_to_person(pcr, person) for person in people_unmatched
            ]
            pcr_comparison_result["possible_matching_people"] = possible_matching_people

            incident_match_results.append(pcr_comparison_result)

        assign_people_to_pcrs(incident_match_results)
        all_match_results += [
            pcr for pcr in incident_match_results if pcr["matched_person_id"]
        ]
        for pcr in incident_match_results:
            updates = None
            if pcr["matched_person_id"]:
                updates = {
                    "person_match_status": "matched_by_automation",
                    "person_id": pcr["matched_person_id"],
                    "person_match_attributes": pcr["person_match_attributes"],
                }
            else:
                updates = {
                    "person_match_status": "unmatched_by_automation",
                }

            try:
                make_hasura_request(
                    query=UPDATE_EMS_PCR,
                    variables={"id": pcr["id"], "updates": updates},
                )
            except EMSPersonIdError:
                """
                It occasionaly happens that records from different EMS incidents
                match the same crash and people. This can happen because of data
                quality issues (such as duplicate EMS records), complex crashes
                that invovle multiple units/locations, or random chance in which
                two crashes with occur near the same place/time involving people
                with the same demographics.

                For example, see crash ID 21074898 and incidents 25292-0255 and
                25292-0273.

                When this happens, the automation may attempt to match the EMS
                record to a person that is already matched to a different EMS
                record, resulting in a violation of the unique constraint on the
                ems__incidents.person_id column.

                This code block handles this case by assigning such records as
                unmatched_by_automation so that they are ignored on future
                ETL runs.
                """
                logger.info(
                    f"Inciden {inc_num}, ID {pcr['id']} will be unmatched due to person_id conflict"
                )
                updates = {
                    "person_match_status": "unmatched_by_automation",
                }
                make_hasura_request(
                    query=UPDATE_EMS_PCR,
                    variables={"id": pcr["id"], "updates": updates},
                )
                pcr["matched_person_id"] = None

            logger.info(
                f"Updated PCR {pcr['id']} from incident {pcr['incident_number']}",
            )


if __name__ == "__main__":
    logger = get_logger("match_ems_to_people", logging.INFO)
    main()
