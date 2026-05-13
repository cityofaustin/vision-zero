"""
CAD incident matching - write pipeline.

For each unprocessed incident:
  1. Fetch candidates within space/time thresholds
  2. Verify the group is closed (every member's candidates == group - {self})
  3. Insert normalized, deduplicated links into cad_incident_links
  4. Update match_status on all group members

Requires env vars:
    HASURA_GRAPHQL_ENDPOINT
"""

# --- config -------------------------------------------------------------------

DISTANCE_THRESHOLD_M = 100
TIME_THRESHOLD_HOURS = 2
MAX_RECORD_TO_PROCESS = 30000

# --- queries ------------------------------------------------------------------

GET_UNPROCESSED = """
query GetUnprocessed($limit: Int!) {
    cad_incidents(
        where: { match_status: { _eq: "unprocessed" } }
        order_by: { response_date: desc }
        limit: $limit
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

INSERT_LINKS = """
mutation InsertLinks($links: [cad_incident_links_insert_input!]!) {
    insert_cad_incident_links(
        objects: $links,
        on_conflict: {
            constraint: unique_pair,
            update_columns: []
        }
    ) {
        affected_rows
    }
}
"""

UPDATE_MATCH_STATUS = """
mutation UpdateMatchStatus($ids: [Int!]!, $match_status: String!) {
    update_cad_incidents(
        where: { master_incident_id: { _in: $ids } }
        _set: { match_status: $match_status }
    ) {
        affected_rows
    }
}
"""

# --- helpers ------------------------------------------------------------------

from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2

from utils.graphql import make_hasura_request


def point_geojson(lon, lat):
    return {"type": "Point", "coordinates": [lon, lat]}


def time_window(response_date: datetime, hours: float) -> tuple[datetime, datetime]:
    delta = timedelta(hours=hours)
    return response_date - delta, response_date + delta


def meters_to_degrees(meters, latitude=30.4):
    """Rough conversion for _st_d_within on a 4326 geometry column."""
    return meters / 111_000


def haversine_m(lat1, lon1, lat2, lon2):
    R = 6_371_000
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def delta_minutes(a: dict, b: dict) -> float:
    ta = datetime.fromisoformat(a["response_date"])
    tb = datetime.fromisoformat(b["response_date"])
    return abs((ta - tb).total_seconds()) / 60


def fetch_candidates(incident: dict) -> list[dict]:
    rd = datetime.fromisoformat(incident["response_date"])
    start, end = time_window(rd, TIME_THRESHOLD_HOURS)
    data = make_hasura_request(
        query=GET_CANDIDATE_MATCHES,
        variables={
            "incident_id": incident["master_incident_id"],
            "geom": point_geojson(incident["longitude"], incident["latitude"]),
            "start": start.isoformat(),
            "end": end.isoformat(),
            "distance": meters_to_degrees(DISTANCE_THRESHOLD_M, incident["latitude"]),
        },
    )
    return data["cad_incidents"]


def make_pair(a: dict, b: dict) -> tuple[int, int]:
    """Return a normalized (lower_id, higher_id) pair."""
    id_a, id_b = a["master_incident_id"], b["master_incident_id"]
    return (id_a, id_b) if id_a < id_b else (id_b, id_a)


def build_links(group: list[dict]) -> list[dict]:
    """
    Build deduplicated link objects for all pairs in the group.
    Each pair is normalized (incident_id_a < incident_id_b).
    """
    seen = set()
    links = []
    for i, a in enumerate(group):
        for b in group[i + 1 :]:
            pair = make_pair(a, b)
            if pair in seen:
                continue
            seen.add(pair)
            id_a, id_b = pair
            # find the actual dicts for metric calculation
            rec_a = a if a["master_incident_id"] == id_a else b
            rec_b = b if b["master_incident_id"] == id_b else a
            links.append(
                {
                    "incident_id_a": id_a,
                    "incident_id_b": id_b,
                    "distance_m": haversine_m(
                        rec_a["latitude"],
                        rec_a["longitude"],
                        rec_b["latitude"],
                        rec_b["longitude"],
                    ),
                    "delta_minutes": delta_minutes(rec_a, rec_b),
                }
            )
    return links


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


# --- pipeline -----------------------------------------------------------------


def run():
    print("Fetching unprocessed incidents...")
    data = make_hasura_request(query=GET_UNPROCESSED, variables={ "limit": MAX_RECORD_TO_PROCESS})
    incidents = data["cad_incidents"]
    print(f"  Found {len(incidents):,} unprocessed incidents\n")

    processed_ids = set()
    counts = {"matched": 0, "unmatched": 0, "ambiguous": 0, "skipped": 0}

    for incident in incidents:
        iid = incident["master_incident_id"]

        if iid in processed_ids:
            counts["skipped"] += 1
            continue

        candidates = fetch_candidates(incident)

        # --- no candidates: mark unmatched and move on ---
        if not candidates:
            make_hasura_request(
                query=UPDATE_MATCH_STATUS,
                variables={"ids": [iid], "match_status": "unmatched"},
            )
            processed_ids.add(iid)
            counts["unmatched"] += 1
            continue

        # --- check group closure ---
        group = [incident] + candidates
        group_ids = [m["master_incident_id"] for m in group]
        closed = is_group_closed(incident, candidates)
        is_ambiguous = not closed

        # --- insert links ---
        if closed:
            links = build_links(group)
            make_hasura_request(query=INSERT_LINKS, variables={"links": links})

        # --- update match status on all group members ---
        status = "ambiguous" if is_ambiguous else "matched"
        make_hasura_request(
            query=UPDATE_MATCH_STATUS,
            variables={"ids": group_ids, "match_status": status},
        )

        processed_ids.update(group_ids)
        counts[status] += len(group)

        print(
            f"  {'AMBIGUOUS' if is_ambiguous else 'matched  '} "
            f"group of {len(group):>2} — anchor {iid} @ {incident['address']}"
        )

    print(f"\n=== Done ===")
    print(f"  Matched   : {counts['matched']:,}")
    print(f"  Unmatched : {counts['unmatched']:,}")
    print(f"  Ambiguous : {counts['ambiguous']:,}")
    print(f"  Skipped   : {counts['skipped']:,} (already processed as part of a group)")


if __name__ == "__main__":
    run()
