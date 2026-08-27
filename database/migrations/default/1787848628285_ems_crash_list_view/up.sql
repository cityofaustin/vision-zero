
--
-- New index which speeds up crash/ems joins
--
CREATE INDEX idx_ems_incidents_crash_person_active 
ON ems__incidents (crash_pk, person_id) 
WHERE is_deleted = FALSE;

--
-- Combined person/patient inuries with:
-- Unmatched people records
-- People records with injury overrides from matched EMS patient care record
-- Unmatched EMS patient care records
--
-- TODO: it might not make sense to include EMS in this view at all - unless needed for crashes_list_view-style view in VZE
-- or maybe we do need it because:
-- TODO: confirm we're properly including EMS records with crash match but no person match
--
create or replace view combined_person_injury_metrics_view as with 
person_severity_resolved AS (
    SELECT
        people.id,
        units.id AS unit_id,
        crashes.id AS crash_pk,
        crashes.cris_crash_id,
        units.vz_mode_category_id,
        people.years_of_life_lost,
        people.est_comp_cost_crash_based,
        CASE
            WHEN people.prsn_injry_sev_id = 4 THEN 4
            WHEN people.prsn_injry_sev_id = 99 THEN 99
            WHEN ems.patient_injry_sev_id IS NOT NULL THEN ems.patient_injry_sev_id
            ELSE people.prsn_injry_sev_id
        END AS inj_sev_id,
        crashes.law_enforcement_ytd_fatality_num,
        people_cris.prsn_injry_sev_id AS cris_prsn_injry_sev_id,
        CASE
            WHEN ems.id IS NOT NULL THEN 'crash_report_plus_ems'
            ELSE 'crash_report'
        END as record_source
    FROM people people
    LEFT JOIN units units ON people.unit_id = units.id
    LEFT JOIN crashes crashes ON units.crash_pk = crashes.id
    LEFT JOIN people_cris people_cris ON people.id = people_cris.id
    LEFT JOIN ems__incidents ems
        ON people.id = ems.person_id
        AND (ems.id IS NULL OR ems.is_deleted = FALSE)
    WHERE people.is_deleted = FALSE
),
person_injury_metrics_resolved AS (
    SELECT
        id,
        unit_id,
        crash_pk,
        cris_crash_id,
        record_source,
        years_of_life_lost,
        est_comp_cost_crash_based,
        CASE WHEN inj_sev_id = 0 THEN 1 ELSE 0 END AS unkn_injry,
        CASE WHEN inj_sev_id = 1 THEN 1 ELSE 0 END AS sus_serious_injry,
        CASE WHEN inj_sev_id = 2 THEN 1 ELSE 0 END AS nonincap_injry,
        CASE WHEN inj_sev_id = 3 THEN 1 ELSE 0 END AS poss_injry,
        CASE WHEN inj_sev_id = 4 OR inj_sev_id = 99 THEN 1 ELSE 0 END AS fatal_injury,
        CASE WHEN inj_sev_id = 4 THEN 1 ELSE 0 END AS vz_fatal_injury,
        CASE
            WHEN (inj_sev_id = 4 OR inj_sev_id = 99)
                AND law_enforcement_ytd_fatality_num IS NOT NULL
                THEN 1
            ELSE 0
        END AS law_enf_fatal_injury,
        CASE WHEN cris_prsn_injry_sev_id = 4 THEN 1 ELSE 0 END AS cris_fatal_injury,
        CASE WHEN inj_sev_id = 5 THEN 1 ELSE 0 END AS non_injry,
        CASE WHEN inj_sev_id = 4 AND vz_mode_category_id = ANY(ARRAY[1,2,4]) THEN 1 ELSE 0 END AS motor_vehicle_fatal_injry,
        CASE WHEN inj_sev_id = 1 AND vz_mode_category_id = ANY(ARRAY[1,2,4]) THEN 1 ELSE 0 END AS motor_vehicle_sus_serious_injry,
        CASE WHEN inj_sev_id = 4 AND vz_mode_category_id = 3 THEN 1 ELSE 0 END AS motorcycle_fatal_injry,
        CASE WHEN inj_sev_id = 1 AND vz_mode_category_id = 3 THEN 1 ELSE 0 END AS motorycle_sus_serious_injry,
        CASE WHEN inj_sev_id = 4 AND vz_mode_category_id = 5 THEN 1 ELSE 0 END AS bicycle_fatal_injry,
        CASE WHEN inj_sev_id = 1 AND vz_mode_category_id = 5 THEN 1 ELSE 0 END AS bicycle_sus_serious_injry,
        CASE WHEN inj_sev_id = 4 AND vz_mode_category_id = 7 THEN 1 ELSE 0 END AS pedestrian_fatal_injry,
        CASE WHEN inj_sev_id = 1 AND vz_mode_category_id = 7 THEN 1 ELSE 0 END AS pedestrian_sus_serious_injry,
        CASE WHEN inj_sev_id = 4 AND vz_mode_category_id = 11 THEN 1 ELSE 0 END AS micromobility_fatal_injry,
        CASE WHEN inj_sev_id = 1 AND vz_mode_category_id = 11 THEN 1 ELSE 0 END AS micromobility_sus_serious_injry,
        CASE WHEN inj_sev_id = 4 AND vz_mode_category_id = ANY(ARRAY[6,8,9]) THEN 1 ELSE 0 END AS other_fatal_injry,
        CASE WHEN inj_sev_id = 1 AND vz_mode_category_id = ANY(ARRAY[6,8,9]) THEN 1 ELSE 0 END AS other_sus_serious_injry
    FROM person_severity_resolved
),
ems_unmatched_persons AS (
    SELECT
        e.id::bigint AS id,
        NULL::bigint AS unit_id,
        e.crash_pk,
        NULL::bigint AS cris_crash_id,
        'ems' as record_source,
        e.years_of_life_lost,
        e.est_comp_cost_crash_based,
        CASE WHEN e.patient_injry_sev_id = 0 THEN 1 ELSE 0 END AS unkn_injry,
        CASE WHEN e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END AS sus_serious_injry,
        CASE WHEN e.patient_injry_sev_id = 2 THEN 1 ELSE 0 END AS nonincap_injry,
        CASE WHEN e.patient_injry_sev_id = 3 THEN 1 ELSE 0 END AS poss_injry,
        CASE WHEN e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END AS fatal_injury,
        CASE WHEN e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END AS vz_fatal_injury,
        0 AS law_enf_fatal_injury,
        0 AS cris_fatal_injury,
        CASE WHEN e.patient_injry_sev_id = 5 THEN 1 ELSE 0 END AS non_injry,
        CASE WHEN e.travel_mode = 'Motor Vehicle' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END AS motor_vehicle_fatal_injry,
        CASE WHEN e.travel_mode = 'Motor Vehicle' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END AS motor_vehicle_sus_serious_injry,
        CASE WHEN e.travel_mode = 'Motorcycle' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END AS motorcycle_fatal_injry,
        CASE WHEN e.travel_mode = 'Motorcycle' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END AS motorycle_sus_serious_injry,
        CASE WHEN e.travel_mode = 'Bicycle' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END AS bicycle_fatal_injry,
        CASE WHEN e.travel_mode = 'Bicycle' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END AS bicycle_sus_serious_injry,
        CASE WHEN e.travel_mode = 'Pedestrian' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END AS pedestrian_fatal_injry,
        CASE WHEN e.travel_mode = 'Pedestrian' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END AS pedestrian_sus_serious_injry,
        CASE WHEN e.travel_mode = 'E-Scooter' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END AS micromobility_fatal_injry,
        CASE WHEN e.travel_mode = 'E-Scooter' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END AS micromobility_sus_serious_injry,
        CASE WHEN e.travel_mode NOT IN ('Motor Vehicle','Motorcycle','Bicycle','Pedestrian','E-Scooter') AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END AS other_fatal_injry,
        CASE WHEN e.travel_mode NOT IN ('Motor Vehicle','Motorcycle','Bicycle','Pedestrian','E-Scooter') AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END AS other_sus_serious_injry
    FROM ems__incidents e
    WHERE e.is_deleted = FALSE
        AND e.person_id IS NULL
)
    SELECT id, unit_id, crash_pk, cris_crash_id, record_source, years_of_life_lost, est_comp_cost_crash_based,
        unkn_injry, sus_serious_injry, nonincap_injry, poss_injry, fatal_injury, vz_fatal_injury,
        law_enf_fatal_injury, cris_fatal_injury, non_injry,
        motor_vehicle_fatal_injry, motor_vehicle_sus_serious_injry,
        motorcycle_fatal_injry, motorycle_sus_serious_injry,
        bicycle_fatal_injry, bicycle_sus_serious_injry,
        pedestrian_fatal_injry, pedestrian_sus_serious_injry,
        micromobility_fatal_injry, micromobility_sus_serious_injry,
        other_fatal_injry, other_sus_serious_injry
    FROM person_injury_metrics_resolved
    UNION ALL
    SELECT id, unit_id, crash_pk, cris_crash_id, record_source, years_of_life_lost, est_comp_cost_crash_based,
        unkn_injry, sus_serious_injry, nonincap_injry, poss_injry, fatal_injury, vz_fatal_injury,
        law_enf_fatal_injury, cris_fatal_injury, non_injry,
        motor_vehicle_fatal_injry, motor_vehicle_sus_serious_injry,
        motorcycle_fatal_injry, motorycle_sus_serious_injry,
        bicycle_fatal_injry, bicycle_sus_serious_injry,
        pedestrian_fatal_injry, pedestrian_sus_serious_injry,
        micromobility_fatal_injry, micromobility_sus_serious_injry,
        other_fatal_injry, other_sus_serious_injry
    FROM ems_unmatched_persons;


--
-- Crash-level metrics built on the combined_person_injury_metrics_view
-- This view holds CRIS crash records with injuries rolled up from people records
-- (inlcuding people records with injury overrides from matched EMS patient care record as well
-- as ems records linked to the crash but not the person level)
--
-- This view does NOT contain synthetic crashes constructed from unmatched EMS patient care records
--
DROP MATERIALIZED VIEW IF EXISTS combined_crash_injury_metrics_view cascade;
CREATE MATERIALIZED VIEW combined_crash_injury_metrics_view AS
SELECT
    crashes.id,
    crashes.cris_crash_id,
    CASE
        WHEN COUNT(*) FILTER (WHERE cpimv.record_source = 'crash_report_plus_ems') > 0
            THEN 'crash_report_plus_ems'
        WHEN COUNT(*) FILTER (WHERE cpimv.record_source = 'ems') > 0
            THEN 'crash_report_plus_ems'   -- unmatched EMS incident linked at crash level, no person match
        ELSE 'crash_report'
    END AS record_source,
    COALESCE(
        SUM(cpimv.unkn_injry), 0::bigint
    )                                                                        AS unkn_injry_count,
    COALESCE(
        SUM(cpimv.nonincap_injry), 0::bigint
    )                                                                        AS nonincap_injry_count,
    COALESCE(
        SUM(cpimv.poss_injry), 0::bigint
    )                                                                        AS poss_injry_count,
    COALESCE(
        SUM(cpimv.non_injry), 0::bigint
    )                                                                        AS non_injry_count,
    COALESCE(
        SUM(cpimv.sus_serious_injry), 0::bigint
    )                                                                        AS sus_serious_injry_count,
    COALESCE(SUM(cpimv.nonincap_injry), 0::bigint)
    + COALESCE(SUM(cpimv.poss_injry), 0::bigint)
    + COALESCE(SUM(cpimv.sus_serious_injry), 0::bigint) AS tot_injry_count,
    COALESCE(
        SUM(cpimv.fatal_injury), 0::bigint
    )                                                                        AS fatality_count,
    COALESCE(
        SUM(cpimv.vz_fatal_injury), 0::bigint
    )                                                                        AS vz_fatality_count,
    COALESCE(
        SUM(cpimv.law_enf_fatal_injury), 0::bigint
    )                                                                        AS law_enf_fatality_count,
    COALESCE(
        SUM(cpimv.cris_fatal_injury), 0::bigint
    )                                                                        AS cris_fatality_count,
    COALESCE(
        SUM(cpimv.motor_vehicle_fatal_injry), 0::bigint
    )                                                                        AS motor_vehicle_fatality_count,
    COALESCE(
        SUM(cpimv.motor_vehicle_sus_serious_injry), 0::bigint
    )                                                                        AS motor_vehicle_sus_serious_injry_count,
    COALESCE(
        SUM(cpimv.motorcycle_fatal_injry), 0::bigint
    )                                                                        AS motorcycle_fatality_count,
    COALESCE(
        SUM(cpimv.motorycle_sus_serious_injry), 0::bigint
    )                                                                        AS motorcycle_sus_serious_count,
    COALESCE(
        SUM(cpimv.bicycle_fatal_injry), 0::bigint
    )                                                                        AS bicycle_fatality_count,
    COALESCE(
        SUM(cpimv.bicycle_sus_serious_injry), 0::bigint
    )                                                                        AS bicycle_sus_serious_injry_count,
    COALESCE(
        SUM(cpimv.pedestrian_fatal_injry), 0::bigint
    )                                                                        AS pedestrian_fatality_count,
    COALESCE(
        SUM(cpimv.pedestrian_sus_serious_injry), 0::bigint
    )                                                                        AS pedestrian_sus_serious_injry_count,
    COALESCE(
        SUM(cpimv.micromobility_fatal_injry), 0::bigint
    )                                                                        AS micromobility_fatality_count,
    COALESCE(
        SUM(cpimv.micromobility_sus_serious_injry), 0::bigint
    )                                                                        AS micromobility_sus_serious_injry_count,
    COALESCE(
        SUM(cpimv.other_fatal_injry), 0::bigint
    )                                                                        AS other_fatality_count,
    COALESCE(
        SUM(cpimv.other_sus_serious_injry), 0::bigint
    )                                                                        AS other_sus_serious_injry_count,
    CASE
        WHEN SUM(cpimv.fatal_injury) > 0 THEN 4
        WHEN SUM(cpimv.sus_serious_injry) > 0 THEN 1
        WHEN SUM(cpimv.nonincap_injry) > 0 THEN 2
        WHEN SUM(cpimv.poss_injry) > 0 THEN 3
        WHEN SUM(cpimv.unkn_injry) > 0 THEN 0
        WHEN SUM(cpimv.non_injry) > 0 THEN 5
        ELSE 0
    END                                                                      AS crash_injry_sev_id,
    COALESCE(
        SUM(cpimv.years_of_life_lost), 0::bigint
    )                                                                        AS years_of_life_lost,
    COALESCE(
        MAX(cpimv.est_comp_cost_crash_based), 20000
    )                                                                        AS est_comp_cost_crash_based,
    COALESCE(
        SUM(cpimv.est_comp_cost_crash_based), 20000::bigint
    )                                                                        AS est_total_person_comp_cost,
    COUNT(*) FILTER (WHERE cpimv.record_source = 'crash_report_plus_ems') AS matched_person_count,
    COUNT(*) FILTER (WHERE cpimv.record_source = 'crash_report')          AS unmatched_person_count,
    COUNT(*) FILTER (WHERE cpimv.record_source = 'ems')                   AS unmatched_ems_count,
    COUNT(*) FILTER (
        WHERE cpimv.record_source IN ('crash_report', 'ems')
          AND (cpimv.sus_serious_injry = 1 OR cpimv.fatal_injury = 1)
    ) AS unmatched_serious_or_fatal_count
FROM crashes crashes
LEFT JOIN combined_person_injury_metrics_view cpimv ON crashes.id = cpimv.crash_pk
WHERE crashes.is_deleted = false
GROUP BY crashes.id, crashes.cris_crash_id;


--
-- Incident level metrics built purely from ems__incidents of record records
-- with no crash/person match.
-- 
-- For performance reasons, it repeats the mode-based injury counts in combined_person_injury_metrics_view 
-- rather than pulling directly from it
--
CREATE OR REPLACE VIEW ems_unmatched_incident_injury_metrics_view AS
SELECT
    e.incident_number,
    COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 0 THEN 1 ELSE 0 END), 0::bigint) AS unkn_injry_count,
    COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 2 THEN 1 ELSE 0 END), 0::bigint) AS nonincap_injry_count,
    COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 3 THEN 1 ELSE 0 END), 0::bigint) AS poss_injry_count,
    COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 5 THEN 1 ELSE 0 END), 0::bigint) AS non_injry_count,
    COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END), 0::bigint) AS sus_serious_injry_count,
    COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 2 THEN 1 ELSE 0 END), 0::bigint)
    + COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 3 THEN 1 ELSE 0 END), 0::bigint)
    + COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END), 0::bigint) AS tot_injry_count,
    COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END), 0::bigint) AS fatality_count,
    COALESCE(SUM(CASE WHEN e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END), 0::bigint) AS vz_fatality_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'Motor Vehicle' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END), 0::bigint) AS motor_vehicle_fatality_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'Motor Vehicle' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END), 0::bigint) AS motor_vehicle_sus_serious_injry_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'Motorcycle' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END), 0::bigint) AS motorcycle_fatality_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'Motorcycle' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END), 0::bigint) AS motorcycle_sus_serious_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'Bicycle' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END), 0::bigint) AS bicycle_fatality_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'Bicycle' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END), 0::bigint) AS bicycle_sus_serious_injry_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'Pedestrian' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END), 0::bigint) AS pedestrian_fatality_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'Pedestrian' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END), 0::bigint) AS pedestrian_sus_serious_injry_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'E-Scooter' AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END), 0::bigint) AS micromobility_fatality_count,
    COALESCE(SUM(CASE WHEN e.travel_mode = 'E-Scooter' AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END), 0::bigint) AS micromobility_sus_serious_injry_count,
    COALESCE(SUM(CASE WHEN e.travel_mode NOT IN ('Motor Vehicle','Motorcycle','Bicycle','Pedestrian','E-Scooter') AND e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END), 0::bigint) AS other_fatality_count,
    COALESCE(SUM(CASE WHEN e.travel_mode NOT IN ('Motor Vehicle','Motorcycle','Bicycle','Pedestrian','E-Scooter') AND e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END), 0::bigint) AS other_sus_serious_injry_count,
    CASE
    WHEN SUM(CASE WHEN e.patient_injry_sev_id = 4 THEN 1 ELSE 0 END) > 0 THEN 4
    WHEN SUM(CASE WHEN e.patient_injry_sev_id = 1 THEN 1 ELSE 0 END) > 0 THEN 1
    WHEN SUM(CASE WHEN e.patient_injry_sev_id = 2 THEN 1 ELSE 0 END) > 0 THEN 2
    WHEN SUM(CASE WHEN e.patient_injry_sev_id = 3 THEN 1 ELSE 0 END) > 0 THEN 3
    WHEN SUM(CASE WHEN e.patient_injry_sev_id = 0 THEN 1 ELSE 0 END) > 0 THEN 0
    WHEN SUM(CASE WHEN e.patient_injry_sev_id = 5 THEN 1 ELSE 0 END) > 0 THEN 5
    ELSE 0
    END AS crash_injry_sev_id,
    COALESCE(SUM(e.years_of_life_lost), 0::bigint) AS years_of_life_lost,
    MAX(e.est_comp_cost_crash_based) AS est_comp_cost_crash_based,
    SUM(e.est_comp_cost_crash_based) AS est_total_person_comp_cost,
    string_agg(DISTINCT e.travel_mode, ' & ') AS units_involved,
    MIN(e.incident_location_address) AS incident_location_address,
    (array_agg(e.geometry))[1] AS geometry,
    MIN(e.austin_full_purpose::int)::boolean AS austin_full_purpose,
    MIN(e.location_id) AS location_id,
    MIN(e.latitude) AS latitude,
    MIN(e.longitude) AS longitude,
    MIN(e.incident_received_datetime) AS incident_received_datetime
FROM ems__incidents e
WHERE e.is_deleted = FALSE
    AND e.person_id IS NULL
    AND e.crash_pk IS NULL
GROUP BY e.incident_number;


DROP MATERIALIZED VIEW IF EXISTS crash_unit_aggregates_view CASCADE;
CREATE MATERIALIZED VIEW crash_unit_aggregates_view AS
SELECT
    crashes.id,
    string_agg(DISTINCT mode_categories.label, ' & '::text) AS units_involved
FROM crashes
LEFT JOIN units ON crashes.id = units.crash_pk
LEFT JOIN lookups.mode_category mode_categories ON units.vz_mode_category_id = mode_categories.id
WHERE crashes.is_deleted = FALSE
GROUP BY crashes.id;

CREATE UNIQUE INDEX idx_crash_unit_aggregates_id ON crash_unit_aggregates_view (id);

CREATE OR REPLACE VIEW crashes_ems_list_view AS
SELECT
    'crashes_' || crashes.id::text                                      AS record_id,
    'crashes'::text                                                     AS record_table_name,
    crashes.record_locator::text                                        AS record_locator,
    crashes.case_id::text                                               AS case_id,
    '/crashes/' || crashes.record_locator AS details_page,
    CASE WHEN crashes.investigat_agency_id = 74 THEN 'apd' ELSE agency.label END AS record_responding_agency,
    crashes.crash_timestamp                                             AS record_timestamp,
    to_char(crashes.crash_timestamp AT TIME ZONE 'America/Chicago', 'YYYY-MM-DD') AS record_date_ct,
    to_char(crashes.crash_timestamp AT TIME ZONE 'America/Chicago', 'HH24:MI:SS') AS record_time_ct,
    upper(to_char(crashes.crash_timestamp AT TIME ZONE 'America/Chicago', 'dy'))  AS record_day_of_week,
    crashes.address_display                                             AS record_address,
    crashes.latitude,
    crashes.longitude,
    crashes.location_id,
    crashes.in_austin_full_purpose,
    unit_aggregates.units_involved,
    CASE WHEN cimv.matched_person_count > 0 THEN TRUE ELSE FALSE END AS has_ems_override,
    CASE
        WHEN cimv.unmatched_serious_or_fatal_count = 0 OR cimv.unmatched_serious_or_fatal_count IS NULL THEN 'fully_matched'
        WHEN cimv.matched_person_count = 0 OR cimv.matched_person_count IS NULL THEN 'unmatched'
        ELSE 'mixed'
    END AS injured_people_match_status,
    cimv.unkn_injry_count, cimv.nonincap_injry_count, cimv.poss_injry_count,
    cimv.non_injry_count, cimv.sus_serious_injry_count, cimv.tot_injry_count,
    cimv.fatality_count, cimv.vz_fatality_count, cimv.law_enf_fatality_count, cimv.cris_fatality_count,
    cimv.motor_vehicle_fatality_count, cimv.motor_vehicle_sus_serious_injry_count,
    cimv.motorcycle_fatality_count, cimv.motorcycle_sus_serious_count,
    cimv.bicycle_fatality_count, cimv.bicycle_sus_serious_injry_count,
    cimv.pedestrian_fatality_count, cimv.pedestrian_sus_serious_injry_count,
    cimv.micromobility_fatality_count, cimv.micromobility_sus_serious_injry_count,
    cimv.other_fatality_count, cimv.other_sus_serious_injry_count,
    cimv.crash_injry_sev_id,
    injry_sev.label                                                     AS crash_injry_sev_desc,
    cimv.years_of_life_lost,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost

FROM crashes
LEFT JOIN combined_crash_injury_metrics_view cimv ON crashes.id = cimv.id
LEFT JOIN crash_unit_aggregates_view unit_aggregates ON crashes.id = unit_aggregates.id
LEFT JOIN lookups.agency ON crashes.investigat_agency_id = agency.id
LEFT JOIN lookups.injry_sev ON cimv.crash_injry_sev_id = injry_sev.id
WHERE crashes.is_deleted = FALSE

UNION ALL

SELECT
    'ems__incidents_' || ei.incident_number                             AS record_id,
    'ems__incidents'::text                                              AS record_table_name,
    ei.incident_number::text                                            AS record_locator,
    ei.incident_number::text                                            AS case_id,
    '/ems/' || ei.incident_number   AS details_page,
    'ems'::text                                                         AS record_responding_agency,
    ei.incident_received_datetime                                       AS record_timestamp,
    to_char(ei.incident_received_datetime AT TIME ZONE 'America/Chicago', 'YYYY-MM-DD') AS record_date_ct,
    to_char(ei.incident_received_datetime AT TIME ZONE 'America/Chicago', 'HH24:MI:SS') AS record_time_ct,
    upper(to_char(ei.incident_received_datetime AT TIME ZONE 'America/Chicago', 'dy'))  AS record_day_of_week,
    ei.incident_location_address                                        AS record_address,
    ei.latitude,
    ei.longitude,
    ei.location_id,
    ei.austin_full_purpose                                              AS in_austin_full_purpose,
    ei.units_involved,

    FALSE                                                                AS has_ems_override,
    'unmatched'::text                                                    AS injured_people_match_status,

    ei.unkn_injry_count, ei.nonincap_injry_count, ei.poss_injry_count,
    ei.non_injry_count, ei.sus_serious_injry_count, ei.tot_injry_count,
    ei.fatality_count, ei.vz_fatality_count, NULL::bigint AS law_enf_fatality_count, NULL::bigint AS cris_fatality_count,
    ei.motor_vehicle_fatality_count, ei.motor_vehicle_sus_serious_injry_count,
    ei.motorcycle_fatality_count, ei.motorcycle_sus_serious_count,
    ei.bicycle_fatality_count, ei.bicycle_sus_serious_injry_count,
    ei.pedestrian_fatality_count, ei.pedestrian_sus_serious_injry_count,
    ei.micromobility_fatality_count, ei.micromobility_sus_serious_injry_count,
    ei.other_fatality_count, ei.other_sus_serious_injry_count,
    ei.crash_injry_sev_id,
    injry_sev.label                                                     AS crash_injry_sev_desc,
    ei.years_of_life_lost,
    ei.est_comp_cost_crash_based,
    ei.est_total_person_comp_cost

FROM ems_unmatched_incident_injury_metrics_view ei
LEFT JOIN lookups.injry_sev ON ei.crash_injry_sev_id = injry_sev.id

ORDER BY record_timestamp DESC;
