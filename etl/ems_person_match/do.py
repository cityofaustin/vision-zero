# from pprint import pprint as print
from itertools import groupby

from utils.graphql import (
    make_hasura_request,
    GET_UNMATCHED_EMS_PCRS,
    GET_UNMATCHED_CRASH_PEOPLE,
    GET_EMS_PCRS_BY_INCIDENT_NUMBER,
)

from utils.field_maps import POSITION_IN_VEHICLE_MAP

AGE_GAP_TOLERANCE = 3

# fmt: off
tests = [
    # if a person matches to a pcr here - assign even if multiple PCRs match
    {
        "name": "a",
        "attrs": ["sex", "ethnicity", "age", "pos_in_vehicle", "travel_mode", "injury_severity"],
    },
    {
        "name": "b",
        "attrs": ["sex", "ethnicity", "age", "pos_in_vehicle", "injury_severity"],
    },
    {
        "name": "c",
        "attrs": ["sex", "ethnicity", "age", "pos_in_vehicle",],
    },
    {
        "name": "d",
        "attrs": ["sex", "ethnicity", "age",],
    },
    {
        "name": "e",
        "attrs": ["sex", "ethnicity", "age_fuzzy"],
    },
    {
        "name": "f",
        "attrs": ["sex", "age_fuzzy"],
    },
]
# fmt: on


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


def is_fuzzy_age_match(pcr, person):
    if pcr["pcr_patient_age"] is None or person["prsn_age"] is None:
        return False
    return abs(pcr["pcr_patient_age"] - person["prsn_age"]) <= AGE_GAP_TOLERANCE


def is_position_in_vehicle_match(pcr, person):
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
    pcr_position_val = str(pcr["mvc_form_position_in_vehicle"]).lower()
    person_position_val = str(person.get("occpnt_pos", {}).get("label", "")).lower()
    if pcr_position_val and person_position_val:
        mapped_pcr_position_val = POSITION_IN_VEHICLE_MAP.get(pcr_position_val)
        return (
            mapped_pcr_position_val and mapped_pcr_position_val == person_position_val
        )
    return False


def is_mode_match(pcr, person):
    # travel_mode -> mode_desc
    # Motorcycle
    # Pedestrian
    # Bicycle
    # E-Scooter
    # Motor Vehicle
    return "todo"


def is_transport_dest_match(pcr, person):
    # prsn_taken_to
    return "todo"


def is_injury_severity_match(pcr, person):
    return pcr["patient_injry_sev_id"] == person["prsn_injry_sev_id"]


def get_unmatched_pcrs(match_results):
    return [pcr for pcr in match_results if not pcr["matched_person_id"]]


def is_person_id_matched(person_id, match_results):
    for pcr in match_results:
        if pcr["matched_person_id"] == person_id:
            return True
    return False


def print_match_results(match_results):
    matched = [pcr for pcr in match_results if pcr["matched_person_id"]]
    print(
        f"{len(matched)} PCRs matched, {len(get_unmatched_pcrs(match_results))} unmatched"
    )


def assign_matches(match_results):
    for test in tests:
        print(f"Starting test: {test['name']}")
        unmatched_pcrs = get_unmatched_pcrs(match_results)
        if not unmatched_pcrs:
            print("No more testing needed")
            break
        for pcr in unmatched_pcrs:
            print(f"Testing PCR ID {pcr['id']}")
            for person in pcr["people"]:
                if is_person_id_matched(person["id"], match_results):
                    # todo: abort earlier if all people are matched
                    print(
                        f"Skipping person ID {person['id']} because they are already matched"
                    )
                    continue
                if all(person[attr] for attr in test["attrs"]):
                    # test passed — assign person_id
                    pcr["matched_person_id"] = person["id"]
                    pcr["test_name_passed"] = test["name"]
                    print(f"matched to person ID {person['id']}")
                    break
    return


def all_equal(iterable):
    """Check that all values in the iterable are equal
    h/t https://stackoverflow.com/questions/3844801/check-if-all-elements-in-a-list-are-equal
    """
    g = groupby(iterable)
    return next(g, True) and not next(g, False)


def main():
    # get all PCRs that are matched to a crash_pk but not a person_id (future: and don't have a "match_attempted" status)
    ems_pcrs_data = make_hasura_request(query=GET_UNMATCHED_EMS_PCRS)
    ems_pcrs = ems_pcrs_data["ems__incidents"]
    # group by incident_number
    inc_nums_todo = []
    for pcr in ems_pcrs:
        inc_num = pcr["incident_number"]
        if inc_num not in inc_nums_todo:
            inc_nums_todo.append(inc_num)
    # attempt to match each PCR to a CRIS person record
    all_match_results = []
    for inc_num in inc_nums_todo:
        # get all PCRs with this incident number (some of which may already be matched)
        pcrs = make_hasura_request(
            query=GET_EMS_PCRS_BY_INCIDENT_NUMBER,
            variables={"incident_number": inc_num},
        )["ems__incidents"]

        # make sure all PCRs have the same crash_pk. it is an extreme edge case but it is
        # possible that not all PCRs are matched to the same crash. ignore these and
        # leave them for manual review
        #
        if not all_equal([pcr["crash_pk"] for pcr in pcrs]):
            print(f"Skipping incident {inc_num} because crash_pks are not uniform")
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

        if not people_unmatched:
            # todo: update needs match status flag
            print("no peep avail")
            continue

        match_results = []
        for pcr in pcrs_unmatched:
            pcr_match_result = {
                "id": pcr["id"],
                "people": [],
                "matched_person_id": None,
                "test_name_passed": [],
            }
            for person in people_unmatched:
                person_match_result = {"id": person["id"]}
                person_match_result["sex"] = is_sex_match(pcr, person)
                person_match_result["ethnicity"] = is_ethnicty_match(pcr, person)
                person_match_result["age_fuzzy"] = is_fuzzy_age_match(pcr, person)
                person_match_result["age"] = is_age_match(pcr, person)
                person_match_result["pos_in_vehicle"] = is_position_in_vehicle_match(
                    pcr, person
                )
                person_match_result["injury_severity"] = is_injury_severity_match(
                    pcr, person
                )
                person_match_result["travel_mode"] = "todo"
                pcr_match_result["people"].append(person_match_result)
            match_results.append(pcr_match_result)
        assign_matches(match_results)
        print_match_results(match_results)
        all_match_results += [pcr for pcr in match_results if pcr["matched_person_id"]]
    stuff = {}
    for stu in all_match_results:
        if stu["test_name_passed"] not in stuff:
            stuff[stu["test_name_passed"]] = 0
        stuff[stu["test_name_passed"]] += 1
    print(stuff)
    breakpoint()


main()
