-- view of fatalities in jurisdiction ID 5 (austin full purpose) with crash attributes joined
CREATE OR REPLACE VIEW view_fatalities AS (
    WITH fatalities_plus_crash AS (
        SELECT
            f.id,
            f.crash_id,
            f.victim_name,
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
            crashes.crash_date,
            crashes.case_id,
            crashes.law_enforcement_num,
            crashes.austin_full_purpose,
            f.is_deleted
        FROM
            fatalities f
        LEFT JOIN atd_txdot_crashes crashes ON f.crash_id = crashes.crash_id
)
SELECT
    id,
    crash_id,
    crash_date,
    year,
    person_id,
    primaryperson_id,
    case_id,
    victim_name,
    location,
    law_enforcement_num,
    ytd_fatal_crash,
    ytd_fatality
FROM
    fatalities_plus_crash
WHERE
    fatalities_plus_crash.austin_full_purpose = 'Y'
AND 
    fatalities_plus_crash.is_deleted = false
);
