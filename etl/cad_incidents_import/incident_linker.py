#!/usr/bin/python
import argparse
from datetime import datetime, timedelta, UTC
import logging
import sys

from utils.graphql import make_hasura_request
from utils.queries import (
    GET_UNPROCESSED_INCIDENTS,
    INSERT_VZ_INCIDENT,
    GET_GEO_TEMPORAL_MATCHES,
    GET_INCIDENT_NUMBER_MATCHES,
    SET_CRASH_VZ_INCIDENT_MATCH,
    SET_EMS_VZ_INCIDENT_MATCH,
    SET_AFD_INCIDENT_MATCH,
)

MIN_RECORD_AGE_HOURS = 24
DISTANCE_THRESHOLD_M = 500
TIME_THRESHOLD_MINUTES = 60
MAX_RECORD_TO_PROCESS = 5000

UNPROCESSED_MATCH_STATUS = "unprocessed"

RECORD_TYPES_LOOKUP = {
    "cad": {
        "table_name": "cad_incidents",
    },
    "ems": {
        "table_name": "ems__incidents",
        "target_record_table_name": "cad_incidents",
        "target_record_responding_agency": "ems",
        "update_mutation": SET_EMS_VZ_INCIDENT_MATCH,
    },
    "afd": {
        "table_name": "afd__incidents",
        "target_record_table_name": "cad_incidents",
        "target_record_responding_agency": "afd",
        "update_mutation": SET_AFD_INCIDENT_MATCH,
    },
    "crashes": {
        "table_name": "crashes",
        "target_record_table_name": "cad_incidents",
        # TODO: how to implement this extra condition?
        "target_record_responding_agency": "apd",
        "update_mutation": SET_CRASH_VZ_INCIDENT_MATCH,
    },
}


def point_geojson(lon, lat):
    return {"type": "Point", "coordinates": [lon, lat]}


def time_window(response_date: datetime, minutes: float) -> tuple[datetime, datetime]:
    delta = timedelta(minutes=minutes)
    return response_date - delta, response_date + delta


def meters_to_degrees(meters):
    """Rough conversion for _st_d_within on a 4326 geometry column."""
    return meters / 104_000


def fetch_incident_number_matches(record: dict, target_table_name: str) -> list[dict]:
    data = make_hasura_request(
        query=GET_INCIDENT_NUMBER_MATCHES,
        variables={
            "record_id": record["record_id"],
            "target_table_name": target_table_name,
            "target_incident_number": record["record_incident_number"],
        },
    )
    return data["vz_incident_records_view"]


def fetch_geo_temporal_matches(record: dict) -> list[dict]:
    record_timestamp = datetime.fromisoformat(record["record_timestamp"])
    start, end = time_window(record_timestamp, TIME_THRESHOLD_MINUTES)
    data = make_hasura_request(
        query=GET_GEO_TEMPORAL_MATCHES,
        variables={
            "record_id": record["record_id"],
            "geom": record["geom"],
            "start": start.isoformat(),
            "end": end.isoformat(),
            "distance": meters_to_degrees(DISTANCE_THRESHOLD_M),
        },
    )
    return data["vz_incident_records_view"]


# def flood_fill_group(anchor: dict) -> set[str]:
#     """
#     Creates groups of incidents by recursively expanding a group starting
#     from anchor by breadth-first search. Each newly discovered member's own
#     neighbors are explored in turn, until the frontier is exhausted.
#     """
#     group_ids = {anchor["master_incident_id"]}
#     # frontier holds full incident dicts so we can call fetch_potential_matches
#     frontier = [anchor]

#     while frontier:
#         current = frontier.pop()
#         for neighbor in fetch_potential_matches(current):
#             nid = neighbor["master_incident_id"]
#             if nid not in group_ids:
#                 group_ids.add(nid)
#                 frontier.append(neighbor)

#     return group_ids


def main(args):
    record_type = args.record_type
    record_table_name = RECORD_TYPES_LOOKUP[record_type]["table_name"]
    record_limit = args.limit
    date_limit = datetime.now(UTC) - timedelta(hours=MIN_RECORD_AGE_HOURS)

    logging.info(
        f"Fetching unprocessed {args.record_type} incidents that occurred before {date_limit}..."
    )

    # todo: remember to sort unprocessed incidents asc instead of desc
    data = make_hasura_request(
        query=GET_UNPROCESSED_INCIDENTS,
        variables={
            "record_table_name": record_table_name,
            "match_status": UNPROCESSED_MATCH_STATUS,
            "record_limit": record_limit,
            "date_limit": date_limit.isoformat(),
        },
    )

    records = data["vz_incident_records_view"]
    logging.info(f"  Found {len(records):,} unprocessed {record_type} records\n")

    if args.dry_run:
        logging.info(f"Dry run: aborting further processing")
        return

    processed_ids = set()
    counts = {
        "records_processed": 0,
        "matched_by_automation_incident_number": 0,
        "matched_by_automation_geo_temporal": 0,
        "multiple_matches_by_automation": 0,
        "vz_incidents_created": 0,
    }

    for record in records:
        iid = record["record_id"]
        # todo: incident match search

        vz_incident_matched_ids = []
        vz_incident_match_status = None

        if record["record_incident_number"]:
            if (
                record_type == "crashes"
                and record["record_responding_agency"] != "AUSTIN POLICE DEPARTMENT"
            ):
                logging.info(
                    f"Skipping incident number match for agency {record["record_responding_agency"]}"
                )
            else:
                logging.info(f"Attempting to match record on incident number")
                target_record_table_name = RECORD_TYPES_LOOKUP[record_type][
                    "target_record_table_name"
                ]
                matches = fetch_incident_number_matches(
                    record, target_record_table_name
                )
                logging.info(f"{len(matches)} incident number matches found")

                vz_incident_matched_ids = [i["vz_incident_id"] for i in matches]

                if vz_incident_matched_ids:
                    vz_incident_match_status = (
                        "multiple_matches_by_automation"
                        if len(vz_incident_matched_ids) > 1
                        else "matched_by_automation_incident_number"
                    )

        # geo-temporal matching
        if (
            not vz_incident_matched_ids
            and record["geom"]
            and record["record_timestamp"]
        ):
            matches = fetch_geo_temporal_matches(record)
            logging.info(f"{len(matches)} geo-temporal matches found")

            vz_incident_matched_ids = [m["vz_incident_id"] for m in matches]
            if vz_incident_matched_ids:
                vz_incident_match_status = (
                    "multiple_matches_by_automation"
                    if len(vz_incident_matched_ids) > 1
                    else "matched_by_automation_geo_temporal"
                )

        if vz_incident_matched_ids:
            counts[vz_incident_match_status] += 1

            vz_incident_id = (
                vz_incident_matched_ids[0]
                if len(vz_incident_matched_ids) == 1
                else None
            )

            logging.info(
                f"Matching {record_table_name} ID {iid} to vz_incidents_id {vz_incident_id} with status {vz_incident_match_status}"
            )

            make_hasura_request(
                query=RECORD_TYPES_LOOKUP[record_type]["update_mutation"],
                variables={
                    "record_id": iid,
                    "vz_incident_id": vz_incident_id,
                    "vz_incident_matched_ids": vz_incident_matched_ids,
                    "vz_incident_match_status": vz_incident_match_status,
                },
            )
        else:
            logging.info(f"Creating new VZ incident")
            vz_data = make_hasura_request(query=INSERT_VZ_INCIDENT, variables={})
            vz_incident_id = vz_data["insert_vz_incidents_one"]["id"]

            logging.info(
                f"Assigning {record_table_name} ID {iid} to newly created vz_incidents_id {vz_incident_id}"
            )

            # todo: make sure we're not setting an empty array of incident ids
            make_hasura_request(
                query=RECORD_TYPES_LOOKUP[record_type]["update_mutation"],
                variables={
                    "record_id": iid,
                    "vz_incident_id": vz_incident_id,
                    "vz_incident_matched_ids": vz_incident_matched_ids,
                    "vz_incident_match_status": "created_by_automation",
                },
            )
            counts["vz_incidents_created"] += 1

        counts["records_processed"] += 1

    logging.info(f"\n=== Done ===")
    logging.info(f" Records processed: {counts['records_processed']:,}")
    logging.info(f"  VZ incidents created: {counts['vz_incidents_created']:,}")
    logging.info(
        f"  VZ incidents matched by incident number: {counts['matched_by_automation_incident_number']:,}"
    )
    logging.info(
        f"  VZ incidents matched by geo-temporal: {counts['matched_by_automation_geo_temporal']:,}"
    )
    logging.info(
        f"  VZ incidents with multiple matches: {counts['multiple_matches_by_automation']:,}"
    )


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)
    parser = argparse.ArgumentParser(
        description=" Todo......spatial+temporal neighbors and inserting new vz_incident_groups records",
        usage="incident_linker.py --limit 1000",
    )
    parser.add_argument(
        "record_type",
        choices=["cad", "ems", "afd", "crashes"],
        help="The type of records to process",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=MAX_RECORD_TO_PROCESS,
        help="The maximum number of records to process",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log if there are records to process without actually doing it",
    )
    args = parser.parse_args()
    main(args)
