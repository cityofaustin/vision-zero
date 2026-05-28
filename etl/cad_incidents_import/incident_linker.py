#!/usr/bin/ python
import argparse
from datetime import datetime, timedelta, UTC
import logging
import sys

from utils.graphql import make_hasura_request
from utils.queries import (
    SET_VZ_INCIDENT_IDS,
    GET_UNPROCESSED_INCIDENTS,
    INSERT_VZ_INCIDENT,
    GET_POTENTIAL_MATCHES,
)

MIN_RECORD_AGE_HOURS = 24
DISTANCE_THRESHOLD_M = 500
TIME_THRESHOLD_MINUTES = 60
MAX_RECORD_TO_PROCESS = 1000


def point_geojson(lon, lat):
    return {"type": "Point", "coordinates": [lon, lat]}


def time_window(response_date: datetime, minutes: float) -> tuple[datetime, datetime]:
    delta = timedelta(minutes=minutes)
    return response_date - delta, response_date + delta


def meters_to_degrees(meters):
    """Rough conversion for _st_d_within on a 4326 geometry column."""
    return meters / 111_000


def fetch_potential_matches(incident: dict) -> list[dict]:
    response_date = datetime.fromisoformat(incident["response_date"])
    start, end = time_window(response_date, TIME_THRESHOLD_MINUTES)
    data = make_hasura_request(
        query=GET_POTENTIAL_MATCHES,
        variables={
            "incident_id": incident["master_incident_id"],
            "geom": point_geojson(incident["longitude"], incident["latitude"]),
            "start": start.isoformat(),
            "end": end.isoformat(),
            "distance": meters_to_degrees(DISTANCE_THRESHOLD_M),
        },
    )
    return data["cad_incidents"]


def is_group_closed(primary: dict, matches: list[dict]) -> bool:
    """
    Verify the group is closed: every member's matches must be
    exactly the rest of the group (no more, no fewer).

    primary's candidates == {B, C, ...}
    B's candidates must == {primary, C, ...}
    C's candidates must == {primary, B, ...}
    """
    # create a set of the
    all_incident_ids = {primary["master_incident_id"]}.union(
        {m["master_incident_id"] for m in matches}
    )
    for member in matches:
        member_matches = fetch_potential_matches(member)
        member_match_ids = {m["master_incident_id"] for m in member_matches}
        expected = all_incident_ids - {member["master_incident_id"]}
        if member_match_ids != expected:
            return False
    return True


def main(args):
    record_limit = args.limit
    date_limit = datetime.now(UTC) - timedelta(hours=MIN_RECORD_AGE_HOURS)

    logging.info(f"Fetching unprocessed incidents that occurred before {date_limit}...")
    data = make_hasura_request(
        query=GET_UNPROCESSED_INCIDENTS,
        variables={
            "record_limit": record_limit,
            "date_limit": date_limit.isoformat(),
        },
    )
    incidents = data["cad_incidents"]
    logging.info(f"  Found {len(incidents):,} unprocessed incidents\n")

    processed_ids = set()
    counts = {
        "cad_incidents_processed": 0,
        "vz_incidents_created": 0,
        "ambiguous": 0,
        "skipped": 0,
    }

    for incident in incidents:
        iid = incident["master_incident_id"]

        if iid in processed_ids:
            counts["skipped"] += 1
            continue

        matches = fetch_potential_matches(incident)

        group = [incident] + matches

        closed = is_group_closed(incident, matches) if matches else True

        if not closed:
            # we cannot use the matched group IDs because the group is not closed
            group_ids = [iid]
        else:
            group_ids = [m["master_incident_id"] for m in group]

        # Create the vz_incident parent row
        vz_data = make_hasura_request(query=INSERT_VZ_INCIDENT, variables={})
        vz_incident_id = vz_data["insert_vz_incidents_one"]["id"]

        # Link all group members to the incident
        make_hasura_request(
            query=SET_VZ_INCIDENT_IDS,
            variables={"ids": group_ids, "vz_incident_id": vz_incident_id},
        )

        logging.info(
            f"Creted vz_incident {vz_incident_id} for group of {len(group_ids):>2} — anchor incident {iid} @ {incident['address']} - {incident['response_date']}"
        )

        # add all incident IDs we've assigned to a group to the list of processed IDs
        processed_ids.update(group_ids)

        counts["vz_incidents_created"] += 1
        counts["cad_incidents_processed"] += len(group_ids)
        counts["ambiguous"] += 1 if not closed else 0
        counts["skipped"] += len(group_ids) - 1

    logging.info(f"\n=== Done ===")
    logging.info(
        f"  CAD recorsds processed (including skipped): {counts['cad_incidents_processed']:,}"
    )
    logging.info(f"  VZ incidents created: {counts['vz_incidents_created']:,}")
    logging.info(f"  Ambiguous incidents seen: {counts['ambiguous']:,}")
    logging.info(
        f"  Skipped: {counts['skipped']:,} (already processed as part of a group)"
    )


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)
    parser = argparse.ArgumentParser(
        description="Group CAD incidents by matching them to temporal and spatial neighbors and inserting new vz_incident_groups records",
        usage="incident_linker.py --limit 1000",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=MAX_RECORD_TO_PROCESS,
        help="The maximum number of records to process",
    )
    args = parser.parse_args()
    main(args)
