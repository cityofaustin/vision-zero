#!/usr/bin/python
import argparse
from datetime import datetime, timedelta, UTC
import logging
import sys

from utils.graphql import make_hasura_request
from utils.queries import (
    GET_GEO_TEMPORAL_MATCHES,
    GET_INCIDENT_NUMBER_MATCHES,
    GET_UNPROCESSED_GEO_TEMPORAL_MATCHES,
    GET_UNPROCESSED_INCIDENTS,
    INSERT_VZ_INCIDENT,
    SET_AFD_INCIDENT_MATCH,
    SET_CAD_VZ_INCIDENT_MATCH,
    SET_CRASH_VZ_INCIDENT_MATCH,
    SET_EMS_VZ_INCIDENT_MATCH,
)

MIN_RECORD_AGE_HOURS = 24
DISTANCE_THRESHOLD_M = 500
TIME_THRESHOLD_MINUTES = 60
MAX_RECORD_TO_PROCESS = 5000

UNPROCESSED_MATCH_STATUS = "unprocessed"

CAD_INCIDENT_NUMBER_MATCH_BY_AGENCY = {
    "apd": {
        "incident_number_match_table_name": "crashes",
        "incident_number_match_responding_agency": "apd",
    },
    "ems": {
        "incident_number_match_table_name": "ems__incidents",
        "incident_number_match_responding_agency": "ems",
    },
    "afd": {
        "incident_number_match_table_name": "afd__incidents",
        "incident_number_match_responding_agency": "afd",
    },
}

RECORD_TYPES_LOOKUP = {
    "cad": {
        "table_name": "cad_incidents",
        "update_mutation": SET_CAD_VZ_INCIDENT_MATCH,
    },
    "afd": {
        "table_name": "afd__incidents",
        "incident_number_match_table_name": "cad_incidents",
        "incident_number_match_responding_agency": "afd",
        "update_mutation": SET_AFD_INCIDENT_MATCH,
    },
    "ems": {
        "table_name": "ems__incidents",
        "incident_number_match_table_name": "cad_incidents",
        "incident_number_match_responding_agency": "ems",
        "update_mutation": SET_EMS_VZ_INCIDENT_MATCH,
    },
    "crashes": {
        "table_name": "crashes",
        "incident_number_match_table_name": "cad_incidents",
        "incident_number_match_responding_agency": "apd",
        "update_mutation": SET_CRASH_VZ_INCIDENT_MATCH,
    },
}


def time_window(response_date: datetime, minutes: float) -> tuple[datetime, datetime]:
    delta = timedelta(minutes=minutes)
    return response_date - delta, response_date + delta


def meters_to_degrees(meters):
    """Rough conversion for _st_d_within on a 4326 geometry column."""
    return meters / 104_000


def fetch_incident_number_matches(
    record: dict,
    incident_number_match_table_name: str,
    incident_number_match_responding_agency: str,
) -> list[dict]:
    """Search the vz_incident_records_view for records which match the current record
    based on incident number. Used to match crashes, ems__incidents, and afd__incidents
    to their corresponding CAD incident records based on a common incident number.

    Args:
        record (dict): The record to be matched
        incident_number_match_table_name (str): The target `record_table_name` in the
            vz_incident_records_view table name to search for matches (effectively always `cad_incidents`)
        incident_number_match_responding_agency (str): The agency name in the vz_incident_records_view to filter
            on for matches (effectively always `afd`, `apd`, or `ems`)

    Returns:
        list[dict]: an array of `vz_incident_id` values from vz_incident_records_view.
    """
    data = make_hasura_request(
        query=GET_INCIDENT_NUMBER_MATCHES,
        variables={
            "record_id": record["record_id"],
            "incident_number_match_table_name": incident_number_match_table_name,
            "incident_number_match_responding_agency": incident_number_match_responding_agency,
            "target_incident_number": record["record_incident_number"],
        },
    )
    return data["vz_incident_records_view"]


def fetch_unprocessed_neighbors(record: dict) -> list[dict]:
    """Geo-temporal neighbors that are themselves still unprocessed.
    Inverse of fetch_geo_temporal_matches: that one finds already-assigned
    records to match *to*; this one finds unassigned peers to cluster *with*.
    """
    record_timestamp = datetime.fromisoformat(record["record_timestamp"])
    start, end = time_window(record_timestamp, TIME_THRESHOLD_MINUTES)
    data = make_hasura_request(
        query=GET_UNPROCESSED_GEO_TEMPORAL_MATCHES,  # new query, see below
        variables={
            "record_id": record["record_id"],
            "record_table_name": record["record_table_name"],
            "geom": record["geom"],
            "start": start.isoformat(),
            "end": end.isoformat(),
            "distance": meters_to_degrees(DISTANCE_THRESHOLD_M),
        },
    )
    return data["vz_incident_records_view"]


def flood_fill_unprocessed(anchor: dict) -> tuple[list[dict], list[str]]:
    """BFS over unprocessed geo-temporal neighbors starting from anchor.

    Returns:
        members: full record dicts in the cluster (including anchor)
    """
    members_by_id = {anchor["record_id"]: anchor}
    frontier = [anchor]
    while frontier:
        current = frontier.pop()
        for neighbor in fetch_unprocessed_neighbors(current):
            nid = neighbor["record_id"]
            if nid not in members_by_id:
                members_by_id[nid] = neighbor
                frontier.append(neighbor)
    return list(members_by_id.values())


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


def main(args):
    record_limit = args.limit
    date_limit = datetime.now(UTC) - timedelta(hours=MIN_RECORD_AGE_HOURS)

    record_type = args.record_type
    record_table_name = RECORD_TYPES_LOOKUP[record_type]["table_name"]

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
        "created_by_automation": 0,
    }

    for record in records:
        iid = record["record_id"]
        logging.info(
            f"Processing record ID {iid} from {record["record_responding_agency"]} at {record["record_address"]} on {record["record_timestamp"]}"
        )

        if iid in processed_ids:
            logging.info(
                "Skipping record because it has been processed by neighboring incident"
            )
            continue

        vz_incident_matched_ids = []
        vz_incident_match_status = None

        if record_type == "cad":
            """
            For cad_incident records, we determine the table and incident number to match to based
            on the responding agency. This allows us to match CAD AFD record to `afd__incidents`,
            EMS to `ems__incidents`, and APD records to APD crashes.
            """
            agency_cfg = CAD_INCIDENT_NUMBER_MATCH_BY_AGENCY.get(
                record["record_responding_agency"], {}
            )
            incident_number_match_table_name = agency_cfg.get(
                "incident_number_match_table_name"
            )
            incident_number_match_responding_agency = agency_cfg.get(
                "incident_number_match_responding_agency"
            )

        else:
            incident_number_match_table_name = RECORD_TYPES_LOOKUP[record_type].get(
                "incident_number_match_table_name"
            )
            incident_number_match_responding_agency = RECORD_TYPES_LOOKUP[
                record_type
            ].get("incident_number_match_responding_agency")

        # attempt to match based on a common incident number
        if record["record_incident_number"] and incident_number_match_table_name:
            # only APD crashes can be matched to cad incidents
            if record_type == "crashes" and record["record_responding_agency"] != "apd":
                logging.info(
                    f"Skipping incident number match for agency {record["record_responding_agency"]}"
                )
            else:
                logging.info(
                    f"Attempting incident number match to {incident_number_match_responding_agency} records in the {incident_number_match_table_name} table"
                )

                matches = fetch_incident_number_matches(
                    record,
                    incident_number_match_table_name,
                    incident_number_match_responding_agency,
                )
                logging.info(f"{len(matches)} incident number matches found")

                # get unique vz_incident_ids from results
                vz_incident_matched_ids = list(
                    set([i["vz_incident_id"] for i in matches])
                )

                if vz_incident_matched_ids:
                    vz_incident_match_status = (
                        "multiple_matches_by_automation"
                        if len(vz_incident_matched_ids) > 1
                        else "matched_by_automation_incident_number"
                    )

        # If we haven't found a match, try to match to an existing vz_incident based on geo-temporal
        if (
            not vz_incident_matched_ids
            and record["geom"]
            and record["record_timestamp"]
        ):
            matches = fetch_geo_temporal_matches(record)
            logging.info(f"{len(matches)} geo-temporal matches found")

            # get unique vz_incident_ids from results
            vz_incident_matched_ids = list(set([m["vz_incident_id"] for m in matches]))

            if vz_incident_matched_ids:
                vz_incident_match_status = (
                    "multiple_matches_by_automation"
                    if len(vz_incident_matched_ids) > 1
                    else "matched_by_automation_geo_temporal"
                )

        # if we have matched to a vz_incident, assign that incident ID
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
            counts["records_processed"] += 1

        else:
            # No existing match - create a new incident
            member_ids = [iid]

            if (
                not vz_incident_matched_ids
                and record["geom"]
                and record["record_timestamp"]
            ):
                # Check for nearby, unprocessed records to group together
                logging.info(
                    f"Search for nearby unprocessed incidents for new VZ incident group"
                )
                members = flood_fill_unprocessed(record)
                member_ids = [m["record_id"] for m in members]
                logging.info(f"Found {len(member_ids) - 1} neighbor incidents")

            # Create new vz_incident
            logging.info(f"Creating new VZ incident")
            vz_data = make_hasura_request(query=INSERT_VZ_INCIDENT, variables={})
            vz_incident_id = vz_data["insert_vz_incidents_one"]["id"]

            # process all o fthe member_ids we've accumulated
            for index, mid in enumerate(member_ids):
                logging.info(
                    f"Assigning {record_table_name} ID {mid} to newly created vz_incidents_id {vz_incident_id}"
                )

                vz_incident_match_status = (
                    "created_by_automation"
                    if index == 0
                    else "matched_by_automation_geo_temporal"
                )

                make_hasura_request(
                    query=RECORD_TYPES_LOOKUP[record_type]["update_mutation"],
                    variables={
                        "record_id": mid,
                        "vz_incident_id": vz_incident_id,
                        "vz_incident_matched_ids": None,
                        "vz_incident_match_status": vz_incident_match_status,
                    },
                )
                processed_ids.add(mid)
                counts[vz_incident_match_status] += 1
                counts["records_processed"] += 1

    logging.info(f"\n=== Done ===")
    logging.info(f" Records processed: {counts['records_processed']:,}")
    logging.info(f"  VZ incidents created: {counts['created_by_automation']:,}")
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
        description="Groups various crash-related records into Vision Zero incidents (vz_incidents)",
        usage="incident_linker.py --limit 1000",
    )
    parser.add_argument(
        "record_type",
        choices=list(RECORD_TYPES_LOOKUP.keys()),
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
