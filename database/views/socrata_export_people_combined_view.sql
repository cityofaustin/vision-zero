-- Most recent migration: database/migrations/default/1787848860828_combined_ems_crash_socrata_exports/up.sql

CREATE OR REPLACE VIEW socrata_export_people_combined_view AS
WITH people_ems_resolved AS (
    SELECT
        people.id,
        people.unit_id,
        crashes.id                AS crash_pk,
        crashes.cris_crash_id,
        crashes.is_temp_record,
        people.is_deleted,
        people.is_primary_person,
        people.prsn_age,
        people.prsn_gndr_id       AS prsn_sex_id,
        gndr.label                AS prsn_sex_label,
        people.prsn_ethnicity_id,
        drvr_ethncty.label        AS prsn_ethnicity_label,
        people.years_of_life_lost,
        people.est_comp_cost_crash_based,
        CASE
            WHEN people.prsn_injry_sev_id = 4 THEN 4
            WHEN people.prsn_injry_sev_id = 99 THEN 99
            WHEN ems.patient_injry_sev_id IS NOT NULL THEN ems.patient_injry_sev_id
            ELSE people.prsn_injry_sev_id
        END                       AS prsn_injry_sev_id,
        units.vz_mode_category_id AS mode_id,
        mode_categories.label     AS mode_desc,
        CASE
            WHEN ems.id IS NOT NULL THEN 'crash_report_and_ems'::text
            ELSE 'crash_report'::text
        END                       AS record_source,
        crashes.crash_timestamp,
        crashes.in_austin_full_purpose,
        crashes.private_dr_fl
    FROM people
    LEFT JOIN units units ON people.unit_id = units.id
    LEFT JOIN crashes crashes ON units.crash_pk = crashes.id
    LEFT JOIN
        lookups.mode_category mode_categories
        ON units.vz_mode_category_id = mode_categories.id
    LEFT JOIN lookups.drvr_ethncty ON people.prsn_ethnicity_id = drvr_ethncty.id
    LEFT JOIN lookups.gndr ON people.prsn_gndr_id = gndr.id
    LEFT JOIN
        ems__incidents ems
        ON people.id = ems.person_id AND (ems.id IS NULL OR ems.is_deleted = FALSE)
    WHERE people.is_deleted = FALSE
),

ems_unmatched_to_person AS (
    SELECT
        e.id,
        NULL::integer               AS unit_id,
        crashes.id                  AS crash_pk,
        crashes.cris_crash_id,
        crashes.is_temp_record,
        FALSE                       AS is_deleted,
        NULL::boolean               AS is_primary_person,
        e.pcr_patient_age           AS prsn_age,
        CASE
            WHEN e.pcr_patient_gender = 'male'::text THEN 1
            ELSE 2
        END                         AS prsn_sex_id,
        upper(e.pcr_patient_gender) AS prsn_sex_label,
        CASE
            WHEN e.pcr_patient_race IS NULL THEN 0
            WHEN e.pcr_patient_race = 'Hispanic or Latino'::text THEN 2
            WHEN e.pcr_patient_race = 'White'::text THEN 1
            WHEN e.pcr_patient_race = 'Black or African American'::text THEN 3
            WHEN e.pcr_patient_race = 'American Indian or Alaska Native'::text THEN 6
            WHEN e.pcr_patient_race = 'Asian'::text THEN 4
            ELSE 5
        END                         AS prsn_ethnicity_id,
        CASE
            WHEN e.pcr_patient_race IS NULL THEN 'UNKNOWN'::text
            WHEN e.pcr_patient_race = 'Hispanic or Latino'::text THEN 'HISPANIC'::text
            WHEN e.pcr_patient_race = 'White'::text THEN 'WHITE'::text
            WHEN e.pcr_patient_race = 'Black or African American'::text THEN 'BLACK'::text
            WHEN
                e.pcr_patient_race = 'American Indian or Alaska Native'::text
                THEN 'AMER. INDIAN/ALASKAN NATIVE'::text
            WHEN e.pcr_patient_race = 'Asian'::text THEN 'ASIAN'::text
            ELSE 'OTHER'::text
        END                         AS prsn_ethnicity_label,
        e.years_of_life_lost,
        e.est_comp_cost_crash_based,
        e.patient_injry_sev_id      AS prsn_injry_sev_id,
        NULL::integer               AS mode_id,
        e.travel_mode               AS mode_desc,
        'ems'::text                 AS record_source,
        crashes.crash_timestamp,
        crashes.in_austin_full_purpose,
        crashes.private_dr_fl
    FROM ems__incidents e
    INNER JOIN crashes crashes ON e.crash_pk = crashes.id
    WHERE e.is_deleted = FALSE AND e.person_id IS NULL
),

ems_unmatched_to_crash AS (
    SELECT
        e.id,
        NULL::integer                           AS unit_id,
        NULL::integer                           AS crash_pk,
        NULL::integer                           AS cris_crash_id,
        FALSE                                   AS is_temp_record,
        FALSE                                   AS is_deleted,
        NULL::boolean                           AS is_primary_person,
        e.pcr_patient_age                       AS prsn_age,
        CASE
            WHEN e.pcr_patient_gender = 'male'::text THEN 1
            ELSE 2
        END                                     AS prsn_sex_id,
        upper(e.pcr_patient_gender)             AS prsn_sex_label,
        CASE
            WHEN e.pcr_patient_race IS NULL THEN 0
            WHEN e.pcr_patient_race = 'Hispanic or Latino'::text THEN 2
            WHEN e.pcr_patient_race = 'White'::text THEN 1
            WHEN e.pcr_patient_race = 'Black or African American'::text THEN 3
            WHEN e.pcr_patient_race = 'American Indian or Alaska Native'::text THEN 6
            WHEN e.pcr_patient_race = 'Asian'::text THEN 4
            ELSE 5
        END                                     AS prsn_ethnicity_id,
        CASE
            WHEN e.pcr_patient_race IS NULL THEN 'UNKNOWN'::text
            WHEN e.pcr_patient_race = 'Hispanic or Latino'::text THEN 'HISPANIC'::text
            WHEN e.pcr_patient_race = 'White'::text THEN 'WHITE'::text
            WHEN e.pcr_patient_race = 'Black or African American'::text THEN 'BLACK'::text
            WHEN
                e.pcr_patient_race = 'American Indian or Alaska Native'::text
                THEN 'AMER. INDIAN/ALASKAN NATIVE'::text
            WHEN e.pcr_patient_race = 'Asian'::text THEN 'ASIAN'::text
            ELSE 'OTHER'::text
        END                                     AS prsn_ethnicity_label,
        e.patient_injry_sev_id                  AS prsn_injry_sev_id,
        e.years_of_life_lost,
        e.est_comp_cost_crash_based,
        NULL::integer                           AS mode_id,
        e.travel_mode                           AS mode_desc,
        'ems'::text                             AS record_source,
        e.incident_received_datetime            AS crash_timestamp,
        e.austin_full_purpose::integer::boolean AS in_austin_full_purpose,
        NULL::boolean                           AS private_dr_fl
    FROM ems__incidents e
    WHERE e.is_deleted = FALSE AND e.person_id IS NULL AND e.crash_pk IS NULL
)

SELECT
    people_ems_resolved.id,
    people_ems_resolved.unit_id,
    people_ems_resolved.crash_pk,
    people_ems_resolved.cris_crash_id,
    people_ems_resolved.is_temp_record,
    people_ems_resolved.is_deleted,
    people_ems_resolved.is_primary_person,
    people_ems_resolved.prsn_age,
    people_ems_resolved.prsn_sex_id,
    people_ems_resolved.prsn_sex_label,
    people_ems_resolved.prsn_ethnicity_id,
    people_ems_resolved.prsn_ethnicity_label,
    people_ems_resolved.prsn_injry_sev_id,
    people_ems_resolved.mode_id,
    people_ems_resolved.mode_desc,
    people_ems_resolved.record_source,
    people_ems_resolved.years_of_life_lost,
    people_ems_resolved.est_comp_cost_crash_based,
    to_char(
        people_ems_resolved.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) AS crash_timestamp,
    to_char(
        (people_ems_resolved.crash_timestamp AT TIME ZONE 'America/Chicago'::text),
        'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) AS crash_timestamp_ct
FROM people_ems_resolved
WHERE
    people_ems_resolved.in_austin_full_purpose = TRUE
    AND people_ems_resolved.private_dr_fl = FALSE
    AND people_ems_resolved.crash_timestamp < (now() - '14 days'::interval)
    AND (people_ems_resolved.prsn_injry_sev_id = 1 OR people_ems_resolved.prsn_injry_sev_id = 4)
UNION ALL
SELECT
    ems_unmatched_to_person.id,
    ems_unmatched_to_person.unit_id,
    ems_unmatched_to_person.crash_pk,
    ems_unmatched_to_person.cris_crash_id,
    ems_unmatched_to_person.is_temp_record,
    ems_unmatched_to_person.is_deleted,
    ems_unmatched_to_person.is_primary_person,
    ems_unmatched_to_person.prsn_age,
    ems_unmatched_to_person.prsn_sex_id,
    ems_unmatched_to_person.prsn_sex_label,
    ems_unmatched_to_person.prsn_ethnicity_id,
    ems_unmatched_to_person.prsn_ethnicity_label,
    ems_unmatched_to_person.prsn_injry_sev_id,
    ems_unmatched_to_person.mode_id,
    ems_unmatched_to_person.mode_desc,
    ems_unmatched_to_person.record_source,
    ems_unmatched_to_person.years_of_life_lost,
    ems_unmatched_to_person.est_comp_cost_crash_based,
    to_char(
        ems_unmatched_to_person.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) AS crash_timestamp,
    to_char(
        (ems_unmatched_to_person.crash_timestamp AT TIME ZONE 'America/Chicago'::text),
        'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) AS crash_timestamp_ct
FROM ems_unmatched_to_person
WHERE
    ems_unmatched_to_person.in_austin_full_purpose = TRUE
    AND ems_unmatched_to_person.private_dr_fl = FALSE
    AND ems_unmatched_to_person.crash_timestamp < (now() - '14 days'::interval)
    AND (
        ems_unmatched_to_person.prsn_injry_sev_id = 1
        OR ems_unmatched_to_person.prsn_injry_sev_id = 4
    )
UNION ALL
SELECT
    ems_unmatched_to_crash.id,
    ems_unmatched_to_crash.unit_id,
    ems_unmatched_to_crash.crash_pk,
    ems_unmatched_to_crash.cris_crash_id,
    ems_unmatched_to_crash.is_temp_record,
    ems_unmatched_to_crash.is_deleted,
    ems_unmatched_to_crash.is_primary_person,
    ems_unmatched_to_crash.prsn_age,
    ems_unmatched_to_crash.prsn_sex_id,
    ems_unmatched_to_crash.prsn_sex_label,
    ems_unmatched_to_crash.prsn_ethnicity_id,
    ems_unmatched_to_crash.prsn_ethnicity_label,
    ems_unmatched_to_crash.prsn_injry_sev_id,
    ems_unmatched_to_crash.mode_id,
    ems_unmatched_to_crash.mode_desc,
    ems_unmatched_to_crash.record_source,
    ems_unmatched_to_crash.years_of_life_lost,
    ems_unmatched_to_crash.est_comp_cost_crash_based,
    to_char(
        ems_unmatched_to_crash.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) AS crash_timestamp,
    to_char(
        (ems_unmatched_to_crash.crash_timestamp AT TIME ZONE 'America/Chicago'::text),
        'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) AS crash_timestamp_ct
FROM ems_unmatched_to_crash
WHERE
    ems_unmatched_to_crash.in_austin_full_purpose = TRUE AND ems_unmatched_to_crash.crash_timestamp < (now() - '14 days'::interval) AND (ems_unmatched_to_crash.prsn_injry_sev_id = 1 OR ems_unmatched_to_crash.prsn_injry_sev_id = 4);
