
---

# ADR: Scope down `vz_incidents` to a read-time view

**Status:** Decided
**Author:** John Clary
**Date:** 2026-08-11

## Decision

We will stop treating `vz_incidents` as a persisted "umbrella" entity that every crash-related record must be grouped into. Instead:

1. Keep the existing crash↔EMS matching system (trigger + manual QA in the editor) as is.
2. Generalize that same pattern to crash↔AFD once AFD patient care records land.
3. Make use of CAD incident data as map/context enrichment — not as a peer record in a fuzzy geo-temporal clustering algorithm.
4. Get our unified view of all crash incidents from a read-time view/query, not a persisted `vz_incident_id` grouping.

This redirects near-term effort toward crash report / EMS-matching UI, ETL, and trigger improvements, and toward reporting — while still working toward a unified analytical view, just assembled at query time instead of pre-grouped and stored.

## Context

A single real-world crash can generate records in our database from four data sources (`crashes`, `ems__incidents`, future `afd__incidents`, `cad_incidents`).

 In order to enable the Vision Zero team needs to be cleanly identify, analyze, and report out on individual crash events, we conceived of a composite new record type that would organize the [various data sources]([#data-sources](https://github.com/cityofaustin/vision-zero/blob/08ebb40bd2aa06f14010f696b28a7bb46ce0c760/database/README.md#data-sources)) under a single containing object.

This record type, `vz_incidents` would be constructed via a geo-temporal matching ETL and persisted in the database. This [slide deck](https://docs.google.com/presentation/d/19VPgBQTFj_Ygj5V0aQFQ8GFnfTemieUddglz6qWURVM/edit?slide=id.p#slide=id.p) outlines the concept.

Signficant implementation work was completed to advance this:

- https://github.com/cityofaustin/vision-zero/pull/2132
- https://github.com/cityofaustin/vision-zero/pull/2068
- https://github.com/cityofaustin/vision-zero/pull/2074
- https://github.com/cityofaustin/vision-zero/pull/2093
- https://github.com/cityofaustin/vision-zero/pull/2108


As work neared alpha release, data quality issues and complexity continued to present challenges and were documented fairly well in [#29705](https://github.com/cityofaustin/atd-data-tech/issues/29705). It has become clear the implementing the persisted VZ umbrella adds complexity with adequately solving the problem of uniquely identifying crash events.
 
For identifying and reporting on crash events, every record falls into exactly one of three buckets — mutually exclusive, collectively exhaustive:

1. **Crash reports**, optionally enriched with matched EMS/AFD injury data — highest detail, but only exists when an officer wrote a report.
2. **Orphan EMS/AFD records** — high-confidence injury severity/mode, so-so location; fill real gaps (~100 unmatched serious EMS injuries/year) but carry double-count risk since they aren't manually reviewed.
3. **Orphan CAD incidents** — high volume, useful disposition data, but the noisiest and least authoritative; useful only as context once deduplicated.

This partition is a **record-level entity-resolution problem**, solvable independently per source pair. It's separate from **unified presentation** — one page/view showing everything near an event — which `vz_incidents` was trying to solve at the same time. Conflating the two is what caused the pain: CAD noise (processed first, chained to itself, then able to absorb any nearby record of any type indefinitely) produced sprawling, contaminated clusters, and the incident linker's 500m/60min proximity match ran fully independent of the crash↔EMS trigger's 1200m/30min + demographic match — two unreconciled definitions of "these records belong together."

## Why this direction

Reporting has a forced function and a deadline-shaped consumer — the public data portal, VZV, council/press — and the Incidents concept currently doesn't. Read-only transportation-engineer users can be served today by crash-centric navigation with matched EMS/AFD attached; no one has yet named the specific workflow that requires a permalinked, cross-source event ID. Getting the record-level math right first is what makes reported numbers defensible; the incident-page use case should be built from validated demand, not speculatively ahead of it.

## Goals & outcomes

1. Injury severity reporting is complete and defensible — reflects all known serious injuries, protected against crash/EMS double-counting.
2. The public sees a fuller picture of traffic injuries in Austin — VZV/Open Data Portal surface crashes that never generated a police report.
3. Internal engineering/analysis staff can act on trustworthy, reusable location-level stats without each reconciling crash/EMS/CAD themselves.
4. Match logic is simple enough to maintain and QA — one trusted system per source pair, not competing, unreconciled ones.

## Priorities

**Public reporting (Open Data Portal + VZV)**
- Go live: EMS-enhanced injury severity reporting (data sharing agreement, quality improvements, VZV updates, DB switchover, comms)
- Incorporate orphaned/unmatched EMS/AFD injuries — likely a separate public dataset + VZV card, not folded into crash-level stats
- Incorporate CAD incidents — replaces current non-CR3 blueform uploads as the "unofficial incident" source

**Internal reporting / analysis**
- VZE: surface overridden values where staff need to see them
- Location-level statistics for orphaned/unmatched EMS/AFD injuries
- Crash manual QA UI improvements (location polygons, CAD lat/long fallback, non-COA roadway overlay, slimmed QA page)
- EMS manual QA UI improvements (match filtering, column/language alignment, CAD map context, name-based matching — blocked by BAA)

**ETL**
- Case ID + address matching, ML-based matching, name-based matching (crash↔EMS/AFD refinement)

## Disposition of work already shipped

Nothing here is "we were wrong, undo it" — it splits into keep and cut.

**Keep, repurposed:**
- `vz_incident_records_view` — becomes the base for the CAD-as-context join and any future read-time "everything near this crash" query.
- Incident-number matching (crash↔CAD, EMS/AFD↔CAD via case ID) in `incident_linker.py` — deterministic and cheap; exactly the CAD-context mechanism we want.
- Editor incident page (`editor/app/incidents/[id]/page.tsx`) — currently stubbed, so pausing it breaks no in-progress workflow. Left dormant; could become a read-only surface later if a use case emerges.

**Cut:**
- The geo-temporal flood-fill clustering in `incident_linker.py` — the fuzzy matching causing sprawling, contaminated groupings.
- The persisted `vz_incidents`/`vz_incident_id` grouping table itself, plus its already-scoped teardown (DB tables/columns, docs, matching ETL, Airflow DAG).
