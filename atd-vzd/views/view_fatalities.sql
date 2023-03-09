-- view of fatalities in jursidiction ID with crash attributes joined
CREATE OR REPLACE VIEW view_fatalities AS (
    WITH fatalities_plus_crash AS (
        SELECT
            f.id,
            f.crash_id,
            f.victim_name,
            f.law_enforcement_num,
            f.ytd_fatal_crash,
            f.ytd_fatality,
            f.person_id,
            f.primaryperson_id,
            TO_CHAR(crashes.crash_date,
                'yyyy') AS year,
            CONCAT_WS(' ',
                crashes.rpt_block_num,
                crashes.rpt_street_pfx,
                crashes.rpt_street_name,
                '(',
                crashes.rpt_sec_block_num,
                crashes.rpt_sec_street_pfx,
                crashes.rpt_sec_street_name,
                ')') AS location,
            crashes.position,
            crashes.crash_date,
            crashes.case_id,
            f.is_deleted
        FROM
            fatalities f
        LEFT JOIN atd_txdot_crashes crashes ON f.crash_id = crashes.crash_id
)
SELECT
    *
FROM
    fatalities_plus_crash
WHERE
    ST_CONTAINS((
        SELECT
            geometry FROM atd_jurisdictions
        WHERE
            atd_jurisdictions.id = 5),
        fatalities_plus_crash.position)
AND 
    fatalities_plus_crash.is_deleted = false
);
