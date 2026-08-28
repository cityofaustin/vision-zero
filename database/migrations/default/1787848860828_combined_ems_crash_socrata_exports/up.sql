

--
-- Updated crash-level socrata export with:
-- CRIS crashes (with injury counts from ems-enhanced people records)
-- Synthetic crashes, aka incidents, constructed from unmatched EMS patient records
--
-- adds record_id, record_table_name, record_source columns. 
-- TODO: check how types line up with existing dataset
-- TODO: consider using "NOT REPORTED" instead of `null` for the many null columns for EMS-only crashes
-- TODO: align travel_mode and units_involved
--
CREATE OR REPLACE VIEW socrata_export_crashes_combined_view AS
SELECT
    'crashes_' || crashes.id::text AS record_id,
    'crashes'::text AS record_table_name,
    crashes.cris_crash_id,
    crashes.case_id,
    crashes.is_deleted,
    crashes.latitude,
    crashes.longitude,
    crashes.address_display,
    crashes.rpt_block_num,
    crashes.rpt_street_name,
    crashes.rpt_street_pfx,
    crashes.rpt_street_sfx,
    location.location_id,
    location.location_group,
    crashes.crash_speed_limit,
    crashes.road_constr_zone_fl,
    crashes.is_temp_record,
    cimv.record_source,
    cimv.crash_injry_sev_id AS crash_sev_id,
    cimv.sus_serious_injry_count AS sus_serious_injry_cnt,
    cimv.nonincap_injry_count AS nonincap_injry_cnt,
    cimv.poss_injry_count AS poss_injry_cnt,
    cimv.non_injry_count AS non_injry_cnt,
    cimv.unkn_injry_count AS unkn_injry_cnt,
    cimv.tot_injry_count AS tot_injry_cnt,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost,
    cimv.law_enf_fatality_count,
    cimv.vz_fatality_count AS death_cnt,
    crashes.onsys_fl,
    crashes.private_dr_fl,
    unit_aggregates.units_involved,
    cimv.motor_vehicle_fatality_count AS motor_vehicle_death_count,
    cimv.motor_vehicle_sus_serious_injry_count AS motor_vehicle_serious_injury_count,
    cimv.bicycle_fatality_count AS bicycle_death_count,
    cimv.bicycle_sus_serious_injry_count AS bicycle_serious_injury_count,
    cimv.pedestrian_fatality_count AS pedestrian_death_count,
    cimv.pedestrian_sus_serious_injry_count AS pedestrian_serious_injury_count,
    cimv.motorcycle_fatality_count AS motorcycle_death_count,
    cimv.motorcycle_sus_serious_count AS motorcycle_serious_injury_count,
    cimv.micromobility_fatality_count AS micromobility_death_count,
    cimv.micromobility_sus_serious_injry_count AS micromobility_serious_injury_count,
    cimv.other_fatality_count AS other_death_count,
    cimv.other_sus_serious_injry_count AS other_serious_injury_count,
    cimv.years_of_life_lost,
    to_char(crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp,
    to_char((crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp_ct,
    CASE
        WHEN crashes.latitude IS NOT NULL AND crashes.longitude IS NOT NULL
            THEN ((('POINT (' || crashes.longitude::text) || ' ') || crashes.latitude::text) || ')'
        ELSE NULL
    END AS point,
    COALESCE(cimv.crash_injry_sev_id = 4, FALSE) AS crash_fatal_fl,
    collsn.label AS collsn_desc
FROM crashes crashes
LEFT JOIN LATERAL (
    SELECT *
    FROM combined_crash_injury_metrics_view
    WHERE crashes.id = combined_crash_injury_metrics_view.id
    LIMIT 1
) cimv ON TRUE
LEFT JOIN lookups.collsn ON crashes.fhe_collsn_id = collsn.id
LEFT JOIN locations location ON crashes.location_id = location.location_id::text
LEFT JOIN crash_unit_aggregates_view unit_aggregates ON crashes.id = unit_aggregates.id
WHERE crashes.is_deleted = FALSE
    AND crashes.in_austin_full_purpose = TRUE
    AND crashes.private_dr_fl = FALSE
    AND crashes.crash_timestamp < (now() - '14 days'::interval)
UNION ALL
SELECT
    'ems_incident_' || ei.incident_number AS record_id,
    'ems__incidents'::text AS record_table_name,
    NULL AS cris_crash_id,
    ei.incident_number AS case_id,
    FALSE AS is_deleted,
    ei.latitude,
    ei.longitude,
    ei.incident_location_address AS address_display,
    NULL AS rpt_block_num,
    NULL AS rpt_street_name,
    NULL AS rpt_street_pfx,
    NULL AS rpt_street_sfx,
    location.location_id,
    location.location_group,
    NULL AS crash_speed_limit,
    NULL AS road_constr_zone_fl,
    FALSE AS is_temp_record,
    'ems'::text AS record_source,
    ei.crash_injry_sev_id AS crash_sev_id,
    ei.sus_serious_injry_count AS sus_serious_injry_cnt, 
    ei.nonincap_injry_count AS nonincap_injry_cnt,
    ei.poss_injry_count AS poss_injry_cnt,
    ei.non_injry_count AS non_injry_cnt,
    ei.unkn_injry_count AS unkn_injry_cnt,
    ei.tot_injry_count AS tot_injry_cnt,
    ei.est_comp_cost_crash_based,
    ei.est_total_person_comp_cost,
    NULL::bigint AS law_enf_fatality_count,   -- never applicable for pure-EMS records
    ei.vz_fatality_count AS death_cnt,
    NULL AS onsys_fl,
    NULL AS private_dr_fl,                    -- unknown for EMS-sourced records
    ei.units_involved,
    ei.motor_vehicle_fatality_count AS motor_vehicle_death_count,
    ei.motor_vehicle_sus_serious_injry_count AS motor_vehicle_serious_injury_count,
    ei.bicycle_fatality_count AS bicycle_death_count,
    ei.bicycle_sus_serious_injry_count AS bicycle_serious_injury_count,
    ei.pedestrian_fatality_count AS pedestrian_death_count,
    ei.pedestrian_sus_serious_injry_count AS pedestrian_serious_injury_count,
    ei.motorcycle_fatality_count AS motorcycle_death_count,
    ei.motorcycle_sus_serious_count AS motorcycle_serious_injury_count,
    ei.micromobility_fatality_count AS micromobility_death_count,
    ei.micromobility_sus_serious_injry_count AS micromobility_serious_injury_count,
    ei.other_fatality_count AS other_death_count,
    ei.other_sus_serious_injry_count AS other_serious_injury_count,
    ei.years_of_life_lost,
    to_char(ei.incident_received_datetime, 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp,
    to_char((ei.incident_received_datetime AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp_ct,
    CASE
        WHEN ei.longitude IS NOT NULL AND ei.latitude IS NOT NULL
            THEN ((('POINT (' || ei.longitude::text) || ' ') || ei.latitude::text) || ')'
        ELSE NULL
    END AS point,
    COALESCE(ei.crash_injry_sev_id = 4, FALSE) AS crash_fatal_fl,
    NULL AS collsn_desc
FROM ems_unmatched_incident_injury_metrics_view ei
LEFT JOIN locations location ON ei.location_id = location.location_id::text
WHERE ei.austin_full_purpose = TRUE
    AND ei.incident_received_datetime < (now() - '14 days'::interval);


--
-- Updated person/patient-level socrata export with:
-- all person/patient level records with injury overrides
-- adds record_source, years_of_life_lost, est_comp_cost_crash_based columns
-- todo: revisit IDs and almost definitely construct a globaly unique row_id
--
CREATE OR REPLACE VIEW socrata_export_people_combined_view AS
WITH
    people_ems_resolved AS (
        -- crash_report and crash_report_and_ems: people rows, optionally enriched by EMS
        SELECT
            people.id,
            people.unit_id,
            crashes.id AS crash_pk,
            crashes.cris_crash_id,
            crashes.is_temp_record,
            people.is_deleted,
            people.is_primary_person,
            people.prsn_age::int,
            people.prsn_gndr_id AS prsn_sex_id,
            gndr.label AS prsn_sex_label,
            people.prsn_ethnicity_id,
            drvr_ethncty.label AS prsn_ethnicity_label,
            people.years_of_life_lost,
            people.est_comp_cost_crash_based,
            CASE
                WHEN people.prsn_injry_sev_id = 4 THEN 4
                WHEN people.prsn_injry_sev_id = 99 THEN 99
                WHEN ems.patient_injry_sev_id IS NOT NULL THEN ems.patient_injry_sev_id
                ELSE people.prsn_injry_sev_id
            END AS prsn_injry_sev_id,
            units.vz_mode_category_id AS mode_id,
            mode_categories.label AS mode_desc,
            CASE
                WHEN ems.id IS NOT NULL THEN 'crash_report_and_ems'
                ELSE 'crash_report'
            END AS record_source,
            crashes.crash_timestamp,
            crashes.in_austin_full_purpose,
            crashes.private_dr_fl
        FROM
            people
            LEFT JOIN units units ON people.unit_id = units.id
            LEFT JOIN crashes crashes ON units.crash_pk = crashes.id
            LEFT JOIN lookups.mode_category mode_categories ON units.vz_mode_category_id = mode_categories.id
            LEFT JOIN lookups.drvr_ethncty ON people.prsn_ethnicity_id = drvr_ethncty.id
            LEFT JOIN lookups.gndr ON people.prsn_gndr_id = gndr.id
            LEFT JOIN ems__incidents ems ON people.id = ems.person_id
            AND (
                ems.id IS NULL
                OR ems.is_deleted = FALSE
            )
        WHERE
            people.is_deleted = FALSE
    ),
    ems_unmatched_to_person AS (
        -- EMS incidents linked to a crash but with no matching `people` row
        SELECT
            e.id AS id,
            NULL::int AS unit_id,
            crashes.id AS crash_pk,
            crashes.cris_crash_id,
            crashes.is_temp_record,
            FALSE AS is_deleted,
            NULL::boolean AS is_primary_person,
            e.pcr_patient_age as prsn_age,
            case when e.pcr_patient_gender = 'male' then 1
                else 2
            end AS prsn_sex_id,
            upper(e.pcr_patient_gender) AS prsn_sex_label,
             CASE
                WHEN e.pcr_patient_race IS NULL THEN 0
                WHEN e.pcr_patient_race = 'Hispanic or Latino' THEN 2
                WHEN e.pcr_patient_race = 'White' THEN 1
                WHEN e.pcr_patient_race = 'Black or African American' THEN 3
                WHEN e.pcr_patient_race = 'American Indian or Alaska Native' THEN 6
                WHEN e.pcr_patient_race = 'Asian' THEN 4
                ELSE 5
            END AS prsn_ethnicity_id,
            CASE WHEN e.pcr_patient_race IS NULL THEN 'UNKNOWN'
                WHEN e.pcr_patient_race = 'Hispanic or Latino' THEN 'HISPANIC'
                WHEN e.pcr_patient_race = 'White' THEN 'WHITE'
                WHEN e.pcr_patient_race = 'Black or African American' THEN 'BLACK'
                WHEN e.pcr_patient_race = 'American Indian or Alaska Native' THEN 'AMER. INDIAN/ALASKAN NATIVE'
                WHEN e.pcr_patient_race = 'Asian' THEN 'ASIAN'
                ELSE 'OTHER'
            END AS prsn_ethnicity_label,
            e.years_of_life_lost,
            e.est_comp_cost_crash_based,
            e.patient_injry_sev_id AS prsn_injry_sev_id,
            NULL::int AS mode_id,
            e.travel_mode AS mode_desc,
            'ems' AS record_source,
            crashes.crash_timestamp,
            crashes.in_austin_full_purpose,
            crashes.private_dr_fl
        FROM
            ems__incidents e
            JOIN crashes crashes ON e.crash_pk = crashes.id
        WHERE
            e.is_deleted = FALSE
            AND e.person_id IS NULL
    ),
    ems_unmatched_to_crash AS (
        -- fully standalone EMS incidents, no crash record at all
        SELECT
            e.id::int AS id,
            NULL::int AS unit_id,
            NULL::int AS crash_pk,
            NULL::int AS cris_crash_id,
            FALSE AS is_temp_record,
            FALSE AS is_deleted,
            NULL::boolean AS is_primary_person,
              e.pcr_patient_age as prsn_age,
            case
                when e.pcr_patient_gender = 'male'
                    then 1
                else 2 
            end as prsn_sex_id,
            upper(e.pcr_patient_gender) AS prsn_sex_label,
             CASE
                WHEN e.pcr_patient_race IS NULL THEN 0
                WHEN e.pcr_patient_race = 'Hispanic or Latino' THEN 2
                WHEN e.pcr_patient_race = 'White' THEN 1
                WHEN e.pcr_patient_race = 'Black or African American' THEN 3
                WHEN e.pcr_patient_race = 'American Indian or Alaska Native' THEN 6
                WHEN e.pcr_patient_race = 'Asian' THEN 4
                ELSE 5
            END AS prsn_ethnicity_id,
            CASE WHEN e.pcr_patient_race IS NULL THEN 'UNKNOWN'
                WHEN e.pcr_patient_race = 'Hispanic or Latino' THEN 'HISPANIC'
                WHEN e.pcr_patient_race = 'White' THEN 'WHITE'
                WHEN e.pcr_patient_race = 'Black or African American' THEN 'BLACK'
                WHEN e.pcr_patient_race = 'American Indian or Alaska Native' THEN 'AMER. INDIAN/ALASKAN NATIVE'
                WHEN e.pcr_patient_race = 'Asian' THEN 'ASIAN'
                ELSE 'OTHER'
            END AS prsn_ethnicity_label,
            e.patient_injry_sev_id AS prsn_injry_sev_id,
            e.years_of_life_lost,
            e.est_comp_cost_crash_based,
            NULL::int AS mode_id,
            e.travel_mode AS mode_desc,
            'ems' AS record_source,
            e.incident_received_datetime AS crash_timestamp,
            e.austin_full_purpose::int::boolean AS in_austin_full_purpose,
            NULL::boolean AS private_dr_fl
        FROM
            ems__incidents e
        WHERE
            e.is_deleted = FALSE
            AND e.person_id IS NULL
            AND e.crash_pk IS NULL
    )
SELECT
    id,
    unit_id,
    crash_pk,
    cris_crash_id,
    is_temp_record,
    is_deleted,
    is_primary_person,
    prsn_age,
    prsn_sex_id,
    prsn_sex_label,
    prsn_ethnicity_id,
    prsn_ethnicity_label,
    prsn_injry_sev_id,
    mode_id,
    mode_desc,
    record_source,
    years_of_life_lost,
    est_comp_cost_crash_based,
    to_char(crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp,
    to_char((crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp_ct
FROM
    people_ems_resolved
WHERE
    in_austin_full_purpose = TRUE
    AND private_dr_fl = FALSE
    AND crash_timestamp < (now() - '14 days'::interval)
    AND (
        prsn_injry_sev_id = 1
        OR prsn_injry_sev_id = 4
    )
UNION ALL
SELECT
    id,
    unit_id,
    crash_pk,
    cris_crash_id,
    is_temp_record,
    is_deleted,
    is_primary_person,
    prsn_age,
    prsn_sex_id,
    prsn_sex_label,
    prsn_ethnicity_id,
    prsn_ethnicity_label,
    prsn_injry_sev_id,
    mode_id,
    mode_desc,
    record_source,
    years_of_life_lost,
    est_comp_cost_crash_based,
    to_char(crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp,
    to_char((crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp_ct
FROM
    ems_unmatched_to_person
WHERE
    in_austin_full_purpose = TRUE
    AND private_dr_fl = FALSE
    AND crash_timestamp < (now() - '14 days'::interval)
    AND (
        prsn_injry_sev_id = 1
        OR prsn_injry_sev_id = 4
    )
UNION ALL
SELECT
    id,
    unit_id,
    crash_pk,
    cris_crash_id,
    is_temp_record,
    is_deleted,
    is_primary_person,
    prsn_age,
    prsn_sex_id,
    prsn_sex_label,
    prsn_ethnicity_id,
    prsn_ethnicity_label,
    prsn_injry_sev_id,
    mode_id,
    mode_desc,
    record_source,
    years_of_life_lost,
    est_comp_cost_crash_based,
    to_char(crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp,
    to_char((crash_timestamp AT TIME ZONE 'America/Chicago'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp_ct
FROM
    ems_unmatched_to_crash
WHERE
    in_austin_full_purpose = TRUE
    AND crash_timestamp < (now() - '14 days'::interval)
    AND (
        prsn_injry_sev_id = 1
        OR prsn_injry_sev_id = 4
    );
