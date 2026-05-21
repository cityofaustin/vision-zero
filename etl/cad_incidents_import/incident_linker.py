"""
CAD incident matching - write pipeline.

For each unprocessed incident:
  1. Fetch candidates within space/time thresholds
  2. If no candidates, create a group of one and mark as matched.
  3. Verify the group is closed (every member's candidates == group - {self})
  4. If closed: create a vz_incidents parent row and link all members to it
  5. If not closed: mark members 'ambiguous'

Requires env vars:
    HASURA_GRAPHQL_ENDPOINT

docker compose -f docker-compose.yml -f docker-compose.local.yml run import incident_linker.py
"""

import argparse
from datetime import datetime, timedelta, UTC
import logging
import sys

from utils.graphql import make_hasura_request

# --- config -------------------------------------------------------------------

MIN_RECORD_AGE_HOURS = 24
DISTANCE_THRESHOLD_M = 500
TIME_THRESHOLD_MINUTES = 30
MAX_RECORD_TO_PROCESS = 1000

# --- queries ------------------------------------------------------------------

# todo: we need a minimum incident age date (24 hours?) to ensure
# that additional incidents are not added after the link processing.

GET_UNPROCESSED = """
query GetUnprocessed($record_limit: Int!, $date_limit: timestamptz = "") {
    cad_incidents(
        where: { vz_incident_match_status: { _eq: "unprocessed" }, response_date: { _lt: $date_limit } }
        order_by: { response_date: desc }
        limit: $record_limit
    ) {
        master_incident_id
        response_date
        latitude
        longitude
        address
    }
}
"""

GET_CANDIDATE_MATCHES = """
query GetCandidateMatches(
    $incident_id: Int!
    $geom: geometry!
    $start: timestamptz!
    $end: timestamptz!
    $distance: Float!
) {
    cad_incidents(
        where: {
            master_incident_id: { _neq: $incident_id }
            response_date: { _gte: $start, _lte: $end }
            geom: { _st_d_within: { distance: $distance, from: $geom } }
        }
    ) {
        master_incident_id
        response_date
        latitude
        longitude
        address
    }
}
"""

UPDATE_MATCH_STATUS = """
mutation UpdateMatchStatus($ids: [Int!]!, $vz_incident_match_status: String!) {
    update_cad_incidents(
        where: { master_incident_id: { _in: $ids } }
        _set: { vz_incident_match_status: $vz_incident_match_status }
    ) {
        affected_rows
    }
}
"""

INSERT_VZ_INCIDENT = """
mutation InsertVzIncident {
    insert_vz_incidents_one(object: {}) {
        id
    }
}
"""

UPDATE_GROUP_MEMBERS = """
mutation UpdateGroupMembers($ids: [Int!]!, $vz_incident_id: bigint!, $vz_incident_match_status: String!) {
    update_cad_incidents(
        where: { master_incident_id: { _in: $ids } }
        _set: { vz_incident_id: $vz_incident_id, vz_incident_match_status: $vz_incident_match_status }
    ) {
        affected_rows
    }
}
"""

# --- helpers ------------------------------------------------------------------


def point_geojson(lon, lat):
    return {"type": "Point", "coordinates": [lon, lat]}


def time_window(response_date: datetime, minutes: float) -> tuple[datetime, datetime]:
    delta = timedelta(minutes=minutes)
    return response_date - delta, response_date + delta


def meters_to_degrees(meters):
    """Rough conversion for _st_d_within on a 4326 geometry column."""
    return meters / 111_000


def fetch_candidates(incident: dict) -> list[dict]:
    response_date = datetime.fromisoformat(incident["response_date"])
    start, end = time_window(response_date, TIME_THRESHOLD_MINUTES)
    data = make_hasura_request(
        query=GET_CANDIDATE_MATCHES,
        variables={
            "incident_id": incident["master_incident_id"],
            "geom": point_geojson(incident["longitude"], incident["latitude"]),
            "start": start.isoformat(),
            "end": end.isoformat(),
            "distance": meters_to_degrees(DISTANCE_THRESHOLD_M),
        },
    )
    return data["cad_incidents"]


def is_group_closed(anchor: dict, candidates: list[dict]) -> bool:
    """
    Verify the group is closed: every candidate's candidates must be
    exactly the rest of the group (no more, no fewer).

    anchor's candidates == {B, C, ...}
    B's candidates must == {anchor, C, ...}
    C's candidates must == {anchor, B, ...}
    """
    group_ids = {anchor["master_incident_id"]} | {
        c["master_incident_id"] for c in candidates
    }

    for member in candidates:
        member_candidates = fetch_candidates(member)
        member_candidate_ids = {c["master_incident_id"] for c in member_candidates}
        expected = group_ids - {member["master_incident_id"]}
        if member_candidate_ids != expected:
            return False
    return True



def main(args):
    record_limit = args.limit
    date_limit = datetime.now(UTC) - timedelta(hours=MIN_RECORD_AGE_HOURS)

    logging.info(f"Fetching unprocessed incidents that occurred before {date_limit}...")
    data = make_hasura_request(
        query=GET_UNPROCESSED,
        variables={
            "record_limit": record_limit,
            "date_limit": date_limit.isoformat(),
        },
    )
    incidents = data["cad_incidents"]
    logging.info(f"  Found {len(incidents):,} unprocessed incidents\n")

    processed_ids = set()
    counts = {"matched": 0, "ambiguous": 0, "skipped": 0}

    for incident in incidents:
        iid = incident["master_incident_id"]

        if iid in processed_ids:
            counts["skipped"] += 1
            continue

        candidates = fetch_candidates(incident)

        group = [incident] + candidates
        group_ids = [m["master_incident_id"] for m in group]
        closed = is_group_closed(incident, candidates) if candidates else True

        if closed:
            # Create the vz_incident parent row
            vz_data = make_hasura_request(query=INSERT_VZ_INCIDENT, variables={})
            vz_incident_id = vz_data["insert_vz_incidents_one"]["id"]

            # Link all group members to it and mark matched
            make_hasura_request(
                query=UPDATE_GROUP_MEMBERS,
                variables={
                    "ids": group_ids,
                    "vz_incident_id": vz_incident_id,
                    "vz_incident_match_status": "matched",
                },
            )
        else:
            # Ambiguous: mark status only, no vz_incident
            make_hasura_request(
                query=UPDATE_MATCH_STATUS,
                variables={"ids": group_ids, "vz_incident_match_status": "ambiguous"},
            )

        processed_ids.update(group_ids)
        counts["matched" if closed else "ambiguous"] += len(group)

        logging.info(
            f"  {'matched  ' if closed else 'AMBIGUOUS'} "
            f"group of {len(group):>2} — anchor {iid} @ {incident['address']}"
        )

    logging.info(f"\n=== Done ===")
    logging.info(f"  Matched   : {counts['matched']:,}")
    logging.info(f"  Ambiguous : {counts['ambiguous']:,}")
    logging.info(f"  Skipped   : {counts['skipped']:,} (already processed as part of a group)")


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
        help="The maximum number of records to process"
    )
    args = parser.parse_args()
    main(args)
