# Decision to not use persisted incident record concept

I'd like to pivot on the VZ incident concept and stop treating `vz_incidents` as a persisted umbrella record that every crash-related record must be grouped into.

TLDR, I think we should

1. Plan to achive our unified view of all incidents usings read-time views/queries.
 - Lower priority — needs further scoping what will make incident views usefult to VZ staff and our other users
 - Will eventually 
2. Set our near term focus on getting unified injury reporting out the door: Crashes + EMS PCRS + getting AFD injuries online.


- This will resemble something like the list in https://github.com/cityofaustin/vision-zero/pull/2074, but 
 -    Fully remove `vz_incidents` from the database and
 -    

3. Bring back the cad-only linker

4. Keep the existing crash↔EMS matching system (trigger + manual QA in the editor) exactly as it is
5. Generalize that same pattern to crash↔AFD once AFD patient care records land
6. Use CAD data only as map/context enrichment — not as a peer record in a fuzzy geo-temporal clustering algorithm.


### Background

We recently began work on creating an overarching, persisted-in-the-database `vz_incident` record type in order to advance the concept of a Vision Zero incident: a composite record that organizes various crash-related records under a single containing object.

It's an idea that we discussed for years, and recently became relevant after we [added CAD incident data](https://github.com/cityofaustin/atd-data-tech/issues/26316) to the database: CAD data provides a new level of visibility that potentially acts as a missing link between our other record types (crashes, EMS, AFD).

We've taken this work quite far:

- [Unify all crash-related records as Vision Zero incidents](https://github.com/cityofaustin/atd-data-tech/issues/29126) [Epic issue]
- [Abstracts the incident-matching ETL for use with all record types](https://github.com/cityofaustin/vision-zero/pull/2068) [PR]
- [Create Vision Zero incidents list page](https://github.com/cityofaustin/vision-zero/pull/2074) [PR]
- [Shows all incident member records on details map](https://github.com/cityofaustin/vision-zero/pull/2108) [PR]
- [Initial Incident documentation](https://github.com/cityofaustin/vision-zero/blob/6ad35a85d7fe76b0f1c98673049f3ca3c32c235e/database/README.md#vision-zero-incidents) [Readme]

As I've continued to iterate on that original incident concept, a number of problems have emerged. The flood-fill incident matching ETL just isn't working. CAD records create sprawling incident clusters that create future QA/QC headaches.

It's *possible* that we could develop a more sophisticated incident matching automation. E.g., we could use distinct search criteria for EMS-crash inident matching versus when matching to CAD records. I explored this and more via https://github.com/cityofaustin/atd-data-tech/issues/29705.

What I think the incident approach is getting wrong is that it treats CAD incidents the same as it does crashes and EMS PCRs, when CAD incidents alone provide little value due to their messiness and lack of detail.

We already have a solid incident-identifying system for the highest-value match: crashes + EMS. These are the most important match to get right, because we risk over or undercounting injuries if crash and EMS injuries are not aligned.

CAD records can provide helpful conext to crash-EMS matching, and we can achieve that by focusing on the existing UIs we have for crash and EMS record editing. Incidents adds another layer of complexity without much value.

For the purpose of how we identify and report incidents, we can collapse our records down to four categories:

1. Crash reports
2. Crash reports enhanced with EMS [and in the future, AFD] injury data
3. EMS/AFD patient care records with with no matching crash report
4. CAD incident records which are not associated with any of the above [aka, non-CR3s]

#1 is production today, numbers #2 and #3 we can achieve without


Although implementing the incident concept would bring a closer representation of what really happened on the ,  don't think it make sense with the shape of our data  don't think we want our incident entity to be something that can associate multiple crashes into the same record. 



No matter how finely we tune our incident matching automation, there will always be QA/QC needed. Features include:

But we've already

- Splitting / cleaning up incidents with more than once crash report
- A new QA interface for linking people to EMS patient care records


One common issues with automated incident creation is that its fairly common for multiple crash reports to be grouped into the same incident. This is rarely desireable, and separating 

Although the concept of an overarching record is sound,  don't think it make sense with the shape of our data  don't think we want our incident entity to be something that can associate multiple crashes into the same record. 



CAD data is too noisy to use in incident matching on its own
Fairly common for multiple crashes to be grouped into the same incident—this is not something we want to be dealing with
I think Incidents are going to introduce QA/QC headaches and complication without a lot of payoff

1. Crash reports (enriched with EMS/AFD injury data when we have a match)
2. EMS and AFD patient care records with no matching crash report
3. CAD incident records which are not associated with any of the above


- Crash
- EMS
- CAD
- Crash + EMS
- Crash + EMS + CAD
- Crash + CAD
- EMS
- EMS + CAD

When counting Non-CR3s, we need to resolve which CAD incidents can be grouped together and which are associated with a crash or PCR.

When counting injuries, we need 

When counting injuries—we don't care about CAD at all




The problem is that `vz_incidents` concept is trying to solve two different problems with one mechanism:

1. **entity resolution**: identify which records represent the same real-world incident
2. **entity visibility**: provide a single view of all incidents


Conflating these i what's causing the pain.

We already have a solid entity-resolution system for the highest-value match: crash ↔ EMS matching via trigger + manual QA. These are the most important match to get right, because we risk over or undercounting injuries if crash and EMS injuries are not aligned.

The generic `incident_linker.py`, by contrast, treats CAD incidents the same as it does crashes and EMS PCRs, when CAD incidents alone provide little value due to their messiness and lack of detail.

For the purpose of how we identify and report crash events, we can collapse the records down to three categories:

1. Crash reports (enriched with EMS/AFD injury data when we have a match)
2. EMS/AFD patient care records with no matching crash report
3. CAD incident records which are not associated with any of the above



### Path forward

To recap, a single real-world crash can generate records across up to four systems:

| Source                                                 | Table            | What it's good for                                                                                                                                | Caveats                                                                                  |
| ------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Law enforcement crash reports (CRIS/CR3, APD blueform) | `crashes`        | The most detailed record: diagram, narrative, units, people, contributing factors. Goes through manual QA/QC for serious/fatal injuries.          | Only exists when an officer wrote a report; lag of weeks-months for CRIS delivery.       |
| EMS patient care records                               | `ems__incidents` | High-confidence injury severity and crash-relatedness. Fills gaps where no crash report exists. Basic mode data (vehicle/ped/bike/scooter).       | Location is so-so (~44m avg distance from QA'd crash location).                          |
| AFD patient care records (future)                      | `afd__incidents` | Expected to be shape-for-shape identical to EMS once available.                                                                                   | Not yet in production.                                                                   |
| CAD incidents (APD/AFD/EMS dispatch)                   | `cad_incidents`  | Bountiful, has disposition data ("someone responded, no one was transported"). ~80% of APD-reported crashes have a matching CAD call via case ID. | Very messy, high duplication risk, least authoritative. Primarily useful as map context. |

For the purpose of how we identify and report crash events, we can collapse the records down to three categories:

1. Crash reports (enriched with EMS/AFD injury data when we have a match)
2. EMS/AFD patient care records with no matching crash report
3. CAD incident records which are not associated with any of the above

#1 and #2 — when they report injuries — are what we should focus on because te

There are two tier of data
<!-- Project: Incorporate EMS data into the Vision Zero platform
https://github.com/cityofaustin/atd-data-tech/issues/14326 -->

This view of incidents is readily avaialble to us today using existing ID linkages between data. Here's a rough example:

<details>
<summary>Sample query of deduplicated crashes, EMS, and CAD records</summary>

```sql
with unified_incidents as (
--
-- Crash reports
--
SELECT
    'crashes_' || c.id::text AS vz_incident_id,
    'crashes'::text AS record_table_name,
    CASE
        WHEN c.investigat_agency_id = 74 THEN 'apd'::text
        ELSE agency.label
    END AS record_responding_agency,
    c.id AS record_id,
    c.case_id AS record_incident_number,
    c.crash_timestamp AS record_timestamp,
    c.address_display AS record_address,
    c."position" AS geom,
    c.latitude,
    c.longitude,
    c.in_austin_full_purpose,
    c.location_id
FROM
    crashes c
    LEFT JOIN lookups.agency agency ON agency.id = c.investigat_agency_id
    LEFT JOIN crashes_cris cris ON c.id = cris.id
WHERE
    c.is_deleted IS FALSE
    AND c.crash_timestamp >= '2024-01-01'
--
-- EMS incidents not linked to a crash report
--
UNION ALL
SELECT DISTINCT ON (ems.incident_number)
    'ems__incidents_' || ems.id::text AS vz_incident_id,
    'ems__incidents'::text AS record_table_name,
    'ems'::text AS record_responding_agency,
    ems.id AS record_id,
    ems.incident_number AS record_incident_number,
    ems.incident_received_datetime AS record_timestamp,
    ems.incident_location_address AS record_address,
    ems.geometry AS geom,
    ems.latitude,
    ems.longitude,
    ems.austin_full_purpose AS in_austin_full_purpose,
    ems.location_id
FROM
    ems__incidents ems
WHERE
    ems.is_deleted IS FALSE
    AND ems.crash_pk IS NULL
    AND ems.incident_received_datetime >= '2024-01-01'
--
-- CAD incidents not linked to a crash or EMS incident
--
UNION ALL
SELECT
    'cad_incidents_' || ci.id::text AS vz_incident_id,
    'cad_incidents'::text AS record_table_name,
    ci.agency_type_short AS record_responding_agency,
    ci.id AS record_id,
    ci.master_incident_number AS record_incident_number,
    ci.response_date AS record_timestamp,
    ci.address AS record_address,
    ci.geom,
    ci.latitude,
    ci.longitude,
    ci.in_austin_full_purpose AS in_austin_full_purpose,
    ci.location_id
FROM
    cad_incidents ci
WHERE
    ci.response_date >= '2024-01-01'
    AND NOT (
        ci.agency_type_short = 'apd'
        AND EXISTS (
            SELECT 1
            FROM crashes c
            WHERE c.investigat_agency_id = 74
                AND c.case_id = ci.master_incident_number
        )
    )
    AND NOT (
        ci.agency_type_short = 'ems'
        AND EXISTS (
            SELECT 1
            FROM ems__incidents ems
            WHERE ems.incident_number = ci.master_incident_number
        )
    ))
    --
    -- Selection from the unified view
    --
    select vz_incident_id, record_table_name, record_timestamp, record_address, location_id from unified_incidents where in_austin_full_purpose = true order by record_timestamp desc;
```

</details>

| vz_incident_id           | record_table_name | record_responding_agency | record_timestamp       | record_address             | disposition                |
| ------------------------ | ----------------- | ------------------------ | ---------------------- | -------------------------- | -------------------------- |
| cad_incidents_618843     | cad_incidents     | afd                      | 2025-07-31 21:31:12+00 | E 7th St / N Ih 35 Svrd Nb | SrvOth - Services Other    |
| ems\_\_incidents_1151914 | ems\_\_incidents  | ems                      | 2025-07-31 21:30:46+00 | E 7th St / N Ih 35 Svrd Nb | reported                   |
| cad_incidents_637569     | cad_incidents     | apd                      | 2025-07-31 21:22:24+00 | 821 Gunter St              | 6 - No Report              |
| cad_incidents_620009     | cad_incidents     | apd                      | 2025-07-31 21:13:22+00 | 6216 Fairway St            | 6 - No Report              |
| cad_incidents_619048     | cad_incidents     | apd                      | 2025-07-31 21:08:57+00 | 7800-8244 Research Blvd Sb | 6 - No Report              |
| cad_incidents_619105     | cad_incidents     | afd                      | 2025-07-31 21:01:35+00 | 8300 N Mopac Expy Sb       | MedPT-Patient Contact Only |
| crashes_1775454          | crashes           | apd                      | 2025-07-31 20:59:00+00 | 8300 N LOOP 1              | reported                   |

This sample illustrates our data qualtiy problems quite nicely. We have a few high-value incident records (an EMS incident response on E 7th S and a crash on LOOP 1) with CAD incident noise in the background with some obvious duplication.



### Next steps

Redirect near-term effort into enhancement that improve crash / EMS data quality, while still working toward a unified crash incident view — just assembled at query time instead of pre-grouped and stored.

- Crash report UI improvements
  - show linked APD CAD incident on map if we have a matched case ID
  - show linked EMS incident on map if it is matched
  - show "review/qa complete" checkmark/chip thing
  - map toggle to show nearby CAD incidents map
    - show linked cad incident (manual relationship in hasura on case-id)
  - map toggle to show location polygon(s)
- EMS matching UI improvements
  - add map marker popups
  - show cad incidents on map
  - Auto-suggest potential matches on the details page
  - Ability to filter possible matching people table
  - EMS match notes
- ETL improvements
  - case ID + address matching
  - ML-based matching
  - name-based matching
- Incidents teardown
  - DB tables and columns
  - DB docs readme
  - Mathching ETL
  - airflow dag
- Add additional metadata to `user_events` so that we can better understand read-only user search + filter behavior
- Develop a new design for a unified view of crash records that does not rely on persisted incident groups. We need to further develop the use case for this view.
