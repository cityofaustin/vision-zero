#!/usr/bin/python
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


def flood_fill_group(anchor: dict) -> set[str]:
    """
    Creates groups of incidents by recursively expanding a group starting
    from anchor by bread-first search. Each newly discovered member's own
    neighbors are explored in turn, until the frontier is exhausted.
    """
    group_ids = {anchor["master_incident_id"]}
    # frontier holds full incident dicts so we can call fetch_potential_matches
    frontier = [anchor]

    while frontier:
        current = frontier.pop()
        for neighbor in fetch_potential_matches(current):
            nid = neighbor["master_incident_id"]
            if nid not in group_ids:
                group_ids.add(nid)
                frontier.append(neighbor)

    return group_ids


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
        "skipped": 0,
    }

    for incident in incidents:
        iid = incident["master_incident_id"]

        if iid in processed_ids:
            counts["skipped"] += 1
            continue

        group_ids = flood_fill_group(incident)

        # Create the vz_incident parent row
        vz_data = make_hasura_request(query=INSERT_VZ_INCIDENT, variables={})
        vz_incident_id = vz_data["insert_vz_incidents_one"]["id"]

        # Link all group members to the incident
        make_hasura_request(
            query=SET_VZ_INCIDENT_IDS,
            variables={"ids": list(group_ids), "vz_incident_id": vz_incident_id},
        )

        logging.info(
            f"Created vz_incident {vz_incident_id} for group of {len(group_ids):>2} — anchor incident {iid} @ {incident['address']} - {incident['response_date']}"
        )

        processed_ids.update(group_ids)

        counts["vz_incidents_created"] += 1
        counts["cad_incidents_processed"] += len(group_ids)
        counts["skipped"] += len(group_ids) - 1

    logging.info(f"\n=== Done ===")
    logging.info(
        f"  CAD records processed (including skipped): {counts['cad_incidents_processed']:,}"
    )
    logging.info(f"  VZ incidents created: {counts['vz_incidents_created']:,}")
    logging.info(
        f"  Skipped: {counts['skipped']:,} (already processed as part of a group)"
    )


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)
    parser = argparse.ArgumentParser(
        description="Group CAD incidents by flood-filling spatial+temporal neighbors and inserting new vz_incident_groups records",
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
