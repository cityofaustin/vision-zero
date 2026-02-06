-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW socrata_export_people_view AS SELECT
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
    people.prsn_injry_sev_id,
    units.vz_mode_category_id AS mode_id,
    mode_categories.label     AS mode_desc,
    to_char(
        crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                         AS crash_timestamp,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'US/Central'::text),
        'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                         AS crash_timestamp_ct
FROM people
LEFT JOIN units units ON people.unit_id = units.id
LEFT JOIN crashes crashes ON units.crash_pk = crashes.id
LEFT JOIN
    lookups.mode_category mode_categories
    ON units.vz_mode_category_id = mode_categories.id
LEFT JOIN lookups.drvr_ethncty ON people.prsn_ethnicity_id = drvr_ethncty.id
LEFT JOIN lookups.gndr ON people.prsn_gndr_id = gndr.id
WHERE
    people.is_deleted = false AND crashes.in_austin_full_purpose = true AND crashes.private_dr_fl = false AND crashes.is_deleted = false AND crashes.crash_timestamp < (now() - '14 days'::interval) AND (people.prsn_injry_sev_id = 1 OR people.prsn_injry_sev_id = 4);
