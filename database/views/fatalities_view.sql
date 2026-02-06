-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW fatalities_view AS SELECT
    people.id AS person_id,
    crashes.id AS crash_pk,
    crashes.cris_crash_id,
    crashes.record_locator,
    crashes.longitude,
    crashes.latitude,
    crashes.address_display,
    units.id AS unit_id,
    concat_ws(
        ' '::text,
        people.prsn_first_name,
        people.prsn_mid_name,
        people.prsn_last_name
    ) AS victim_name,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'yyyy'::text
    ) AS year,
    crashes.crash_timestamp,
    concat_ws(
        ' '::text,
        crashes.rpt_block_num,
        crashes.rpt_street_pfx,
        crashes.rpt_street_name,
        '(',
        crashes.rpt_sec_block_num,
        crashes.rpt_sec_street_pfx,
        crashes.rpt_sec_street_name,
        ')'
    ) AS location,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'US/Central'::text),
        'YYYY-MM-DD'::text
    ) AS crash_date_ct,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'US/Central'::text),
        'HH24:MI:SS'::text
    ) AS crash_time_ct,
    row_number()
        OVER (
            PARTITION BY
                (
                    extract(
                        YEAR FROM (
                            crashes.crash_timestamp AT TIME ZONE 'US/Central'::text
                        )
                    )
                )
            ORDER BY ((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text))
        )
        AS ytd_fatality,
    dense_rank()
        OVER (
            PARTITION BY
                (
                    extract(
                        YEAR FROM (
                            crashes.crash_timestamp AT TIME ZONE 'US/Central'::text
                        )
                    )
                )
            ORDER BY
                ((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text)),
                crashes.id
        )
        AS ytd_fatal_crash,
    crashes.case_id,
    crashes.law_enforcement_ytd_fatality_num,
    crashes.engineering_area_id
FROM people
LEFT JOIN units ON people.unit_id = units.id
LEFT JOIN crashes ON units.crash_pk = crashes.id
WHERE
    crashes.in_austin_full_purpose = true AND people.prsn_injry_sev_id = 4 AND crashes.private_dr_fl = false AND crashes.is_deleted = false;
