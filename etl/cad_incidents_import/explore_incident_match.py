"""
CAD incident matching - exploratory script.

Goals:
- Understand the shape/distribution of the data
- Test spatial/temporal proximity assumptions
- Lay groundwork for a matching pipeline

Requires env vars:
    HASURA_GRAPHQL_ENDPOINT
"""

# --- config -------------------------------------------------------------------

DISTANCE_THRESHOLD_M = 1000  # meters - tune this
TIME_THRESHOLD_HOURS = 1  # hours - tune this
SAMPLE_LIMIT = 1000  # rows to pull for exploration
EXPLORE_WINDOW_START = "2024-01-01T00:00:00+00:00"
EXPLORE_WINDOW_DAYS = 3

# --- queries ------------------------------------------------------------------

GET_DATE_RANGE = """
query GetDateRange {
    cad_incidents_aggregate {
        aggregate {
            count
            min { response_date }
            max { response_date }
        }
    }
}
"""

GET_SAMPLE = """
query GetSample($limit: Int!) {
    cad_incidents(limit: $limit, order_by: { response_date: desc }) {
        master_incident_id
        response_date
        address
        latitude
        longitude
    }
}
"""

# Fetch a time-windowed batch of incidents (anchor records to match from)
GET_INCIDENTS_IN_WINDOW = """
query GetIncidentsInWindow($start: timestamptz!, $end: timestamptz!) {
    cad_incidents(
        where: { response_date: { _gte: $start, _lte: $end } }
        order_by: { response_date: asc }
    ) {
        master_incident_id
        response_date
        address
        latitude
        longitude
        agency_type
        call_disposition
    }
}
"""

# For a given incident, find nearby candidates within space+time thresholds
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
        address
        latitude
        longitude
        call_disposition
        agency_type
    }
}
"""

# --- helpers ------------------------------------------------------------------

from datetime import datetime, timedelta, timezone

from utils.graphql import make_hasura_request


def point_geojson(lon, lat):
    """Return a GeoJSON Point dict for use as a Hasura geometry variable."""
    return {"type": "Point", "coordinates": [lon, lat]}


def time_window(response_date: datetime, hours: float) -> tuple[datetime, datetime]:
    """Return a symmetric time window around a given datetime."""
    delta = timedelta(hours=hours)
    return response_date - delta, response_date + delta


def find_candidates(incident: dict) -> list[dict]:
    """
    For a single incident, query Hasura for spatially and temporally
    nearby records that could represent the same real-world event.
    """
    rd = datetime.fromisoformat(incident["response_date"])
    start, end = time_window(rd, TIME_THRESHOLD_HOURS)
    geom = point_geojson(incident["longitude"], incident["latitude"])

    data = make_hasura_request(
        query=GET_CANDIDATE_MATCHES,
        variables={
            "incident_id": incident["master_incident_id"],
            "geom": geom,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "distance": meters_to_degrees(DISTANCE_THRESHOLD_M),
        },
    )
    return data["cad_incidents"]


def meters_to_degrees(meters, latitude=30.4):
    """NOT PRODUCTION READY
    Rough conversion for _st_d_within on a 4326 geometry column."""
    return meters / 111_000


# --- exploration steps --------------------------------------------------------


def explore_date_range():
    print("\n=== Date range & row count ===")
    data = make_hasura_request(query=GET_DATE_RANGE)
    agg = data["cad_incidents_aggregate"]["aggregate"]
    print(f"  Total rows : {agg['count']:,}")
    print(f"  Earliest   : {agg['min']['response_date']}")
    print(f"  Latest     : {agg['max']['response_date']}")


def explore_sample():
    print(f"\n=== Sample ({SAMPLE_LIMIT} rows) ===")
    data = make_hasura_request(query=GET_SAMPLE, variables={"limit": SAMPLE_LIMIT})
    incidents = data["cad_incidents"]
    print(f"  Fetched: {len(incidents)} records")

    null_geom = sum(
        1 for r in incidents if r["latitude"] is None or r["longitude"] is None
    )
    print(f"  Missing geometry: {null_geom}")

    return incidents


def explore_candidate_pairs():
    """
    Pull a narrow time window, run candidate matching for each incident,
    and print results. Helps calibrate thresholds before running at scale.
    """
    print(
        f"\n=== Candidate pairs (thresholds: {DISTANCE_THRESHOLD_M}m / {TIME_THRESHOLD_HOURS}h) ==="
    )

    start = datetime.fromisoformat(EXPLORE_WINDOW_START)
    end = start + timedelta(days=EXPLORE_WINDOW_DAYS)

    data = make_hasura_request(
        query=GET_INCIDENTS_IN_WINDOW,
        variables={"start": start.isoformat(), "end": end.isoformat()},
    )

    incidents = data["cad_incidents"]
    print(f"  Incidents in window: {len(incidents)}")

    # skip records with missing geometry
    incidents = [i for i in incidents if i["latitude"] and i["longitude"]]
    print(f"  With geometry: {len(incidents)}")

    total_pairs = 0
    multi_match = 0
    no_match = 0

    for incident in incidents:
        candidates = find_candidates(incident)
        if candidates:
            total_pairs += len(candidates)
            if len(candidates) > 1:
                multi_match += 1
            print(
                f"\n  Incident {incident['master_incident_id']} @ {incident['address']} - {incident['response_date']} - {incident["agency_type"]}"
            )
            for c in candidates:
                print(
                    f"    -> {c['master_incident_id']} @ {c['address']} ({c['response_date']}) - {c["agency_type"]}"
                )
        else:
            no_match += 1
            # print(f"\n  Incident {incident['master_incident_id']} @ {incident['address']} - {incident['response_date']} - {incident["agency_type"]} - {incident["call_disposition"]}")

    print(f"\n  Total candidate pairs found : {total_pairs}")
    print(f"  Incidents with 2+ matches   : {multi_match}  # ambiguity candidates")
    print(f"  Incidents with no matches   : {no_match}")


if __name__ == "__main__":
    explore_date_range()
    explore_sample()
    explore_candidate_pairs()
