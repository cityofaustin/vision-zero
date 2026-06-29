# Vision Zero Incidents


This script is responsible for creating and linking crash-related records to [Vision Zero Incidents](../../database/README.md#vision-zero-incidents).


## Background

A single real-world crash is often seen by multiple public-safety systems — an APD crash report, one or more CAD calls, an EMS patient record, an AFD response — each recorded in its own table. `incident_linker.py` groups these disparate records under a shared `vz_incidents` record so that downstream consumers can reason about the complete response to a single event.

The script processes one record type per run (`cad`, `crashes`, `ems`, or `afd`), reading from `vz_incident_records_view` — a unified view that exposes all four source tables under a common schema (record_id, record_incident_number, record_responding_agency, record_timestamp, geom, etc.).

Only records older than 24 hours are considered, to ensure they've had time to be fully populated upstream before matching.

For each unprocessed record, the script attempts to link it to an existing VZ incident using two strategies, in order:

1. **Incident-number match**. When the record carries a shared identifier that another system uses for the same event, the script matches on that number. The valid edges are: crashes ↔ CAD (on `case_id` / `master_incident_number`), EMS ↔ CAD, and AFD ↔ CAD.
This is the most reliable signal, since a shared incident number is a near-certain indication of the same real-world event.

2. **Geo-temporal proximity**. If no incident-number match is found (or none is possible for this record), the script searches `vz_incident_records_view` for any already-linked record within 500 meters and 60 minutes. If exactly one VZ incident matches, the record links to it; if more than one incident matches, the record is left for manual QA with its matched candidate IDs stored in the `vz_incident_matched_ids` column.

3. If no existing proximal incidents are found, the script uses a **recursive breadth-first search** to find geo-temporal matches for _unprocessed_ incidents. Starting from an unprocessed anchor incident, the script flood-fills outward, pulling in any neighboring incidents within 500 meters and 60 minutes of each group member. This process repeats for each newly added member until no new neighbors are found. Once a group is finalized, a parent `vz_incidents` record is created and all CAD incidents in the group are linked to it.

   The geo-temporal matching alogrithm is illustrated below, in which CAD incidents A, B, C are grouped into a single incident based on their spatial proximity. Although A and C are not within the search radius of each other, the recursive matching of A → B → C leads to formation of the three-member group.

![diagram](docs/cad_incidents_chained.png)

**A note on crash–CAD matching and agency coverage**. Crash reports arrive from every law-enforcement agency operating in the tri-county area, but CAD data exists only for the City of Austin's responders (APD, AFD, EMS). A crash can therefore only have a CAD counterpart when APD was the responding agency. The script encodes this by skipping incident-number matching for any crash where `record_responding_agency` is not `apd`.

The outcome of each record's matching attempt is written back to the source table's `vz_incident_match_status` column.

## Local development

1. Save a copy of the `env_template` file as `.env`, and fill in the details. Make sure to set the `BUCKET_ENV` variable to `dev` in order to safely run the S3 operations locally.

2. Start your local Vision Zero cluster (database + Hasura + editor).

3. Build the docker image using `docker compose`, this is only necessary the first time you run the script, or when updating Python package dependencies.

```shell
docker compose build
```

### Usage

The script is run on a per-record-type basis by passing the record type name as the first argument (`cad`,`afd`,`ems`,`crashes`). 

```shell
docker compose run incidents incident_linker.py cad --dry-run --limit 100
```

Additional options

```
  --limit (default: 5000)  The maximum number of records to process
  --dry-run                Log if there are records to process without actually doing it
```

## Production run

In production, ensure the env var for `HASURA_GRAPHQL_ENDPOINT` and `HASURA_GRAPHQL_ADMIN_SECRET` are set to the production endpoint.

```shell
# invoke the incident linker for all record types
python incident_linker.py cad
python incident_linker.py afd
python incident_linker.py ems
python incident_linker.py crashes
```

## Deployment + CI

A github action is configured to build and push this ETL's image (`atddocker/vz-incidents`) to Docker hub whenever files in this directory are changed.

The ETL itself is deployed via [atd-airflow](https://github.com/cityofaustin/atd-airflow).
