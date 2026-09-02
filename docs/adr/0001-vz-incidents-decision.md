
---

# ADR: Retire the `vz_incidents` entity - resolve records at the source, unify on-demand

**Author:** John Clary
**Date:** 2026-08-11

## Decision

We will stop treating `vz_incidents` as a persisted "umbrella" entity that every crash-related record must be grouped into. Instead:

1. Derive our unified view of all crash incidents from a read-time view/query, not a persisted `vz_incident_id` grouping (See [#29950](https://github.com/cityofaustin/atd-data-tech/issues/29950) for proof of concept).
2. Keep the existing crash↔EMS matching system (trigger + manual QA in the editor) as is.
3. Generalize that same pattern to crash↔AFD once AFD patient care records land.
4. Make use of CAD incident data as map/context enrichment — not as a peer record in a fuzzy geo-temporal clustering algorithm.

This redirects near-term effort toward crash report / EMS-matching UI, ETL, and trigger improvements, and toward reporting — while still working toward a unified analytical view, just assembled at query time instead of pre-grouped and stored.

## Context

A single real-world crash can generate records in our database from four data sources (`crashes`, `ems__incidents`, future `afd__incidents`, `cad_incidents`).

 In order to enable the Vision Zero team needs to be cleanly identify, analyze, and report out on individual crash events, we conceived of a composite new record type that would organize the [various data sources]([#data-sources](https://github.com/cityofaustin/vision-zero/blob/08ebb40bd2aa06f14010f696b28a7bb46ce0c760/database/README.md#data-sources)) under a single containing object.

This record type, `vz_incidents`, would be constructed via a geo-temporal matching ETL and persisted in the database. This [slide deck](https://docs.google.com/presentation/d/19VPgBQTFj_Ygj5V0aQFQ8GFnfTemieUddglz6qWURVM/edit?slide=id.p#slide=id.p) outlines the concept.

Significant implementation work was completed to advance this:

- https://github.com/cityofaustin/vision-zero/pull/2068
- https://github.com/cityofaustin/vision-zero/pull/2074
- https://github.com/cityofaustin/vision-zero/pull/2093
- https://github.com/cityofaustin/vision-zero/pull/2108


As work neared alpha release, data quality issues and complexity continued to present challenges and were documented fairly well in [#29705](https://github.com/cityofaustin/atd-data-tech/issues/29705). It has become clear that implementing the persisted VZ umbrella adds complexity without adequately solving the problem of uniquely identifying crash events.
 
For identifying and reporting on crash events, every record falls into exactly one of three buckets — mutually exclusive, collectively exhaustive:

1. **Crash reports**, optionally enriched with matched EMS/AFD injury data — highest detail, but only exists when an officer wrote a report.
2. **Orphan EMS/AFD records** — high-confidence injury severity/mode, so-so location; fill real gaps (~100 unmatched serious EMS injuries/year) but carry double-count risk since they aren't manually reviewed.
3. **Orphan CAD incidents** — high volume, useful disposition data, but the noisiest and least authoritative; useful only as context once deduplicated.

This partition is a **record-level entity-resolution problem**, solvable independently per source record. It's separate from **unified presentation** — one page/view showing everything near an event — which `vz_incidents` was trying to solve at the same time. Conflating the two has caused the pain: CAD noise (processed first, chained to itself, then able to absorb any nearby record of any type indefinitely) produced sprawling, contaminated clusters, and the incident linker's 500m/60min proximity match ran fully independent of the crash↔EMS trigger's 1200m/30min + demographic match — two unreconciled definitions of "these records belong together."

It's *possible* that we could develop a more sophisticated incident matching automation. E.g., we could use distinct search criteria for EMS-crash incident matching versus when matching to CAD records; we explored this and more via https://github.com/cityofaustin/atd-data-tech/issues/29705. But this approach still muddles the problems of entity resolution and unified presentation when we have a much simpler and adequate path for deriving our unified view of incidents by querying over existing record relationships.

## Why this direction

We are re-focusing on discrete goals around getting impactful data to our crash data consumers: the Vision Zero team, transportation engineers, and the public (via the Open Data Portal and Vision Zero Viewer). The persitsted incidents concept has proven not to advance that need. 

VZE UI enhancements targeting unified views of "incidents" need further refinement, and we have not yet named functionality that calls for a permalinked, cross-source event ID. should can proceed with getting the record-level injury math right first - with the existing data we have - to ensure we have defensible metrics.

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

It's being torn down via https://github.com/cityofaustin/atd-data-tech/issues/30060.
