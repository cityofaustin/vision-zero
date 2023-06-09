-- view of fatalities in jurisdiction ID 5 (austin full purpose) with crash attributes joined
CREATE OR REPLACE VIEW view_fatalities AS (
    SELECT
        f.id,
        f.crash_id,
        f.person_id,
        f.primaryperson_id,
        -- if record is primary person then concat primary person names else if person then concat person names.
        -- also nullify empty string values
        CASE WHEN f.primaryperson_id IS NOT NULL THEN NULLIF(CONCAT_WS(' ', primaryperson.prsn_first_name, primaryperson.prsn_mid_name, primaryperson.prsn_last_name), '')
        WHEN f.person_id IS NOT NULL THEN NULLIF(CONCAT_WS(' ', person.prsn_first_name, person.prsn_mid_name, person.prsn_last_name), '')
        END AS victim_name,
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
        crashes.crash_time,
        -- get ytd fatality, partition by year and sort by date/time
        ROW_NUMBER() OVER (
            PARTITION BY EXTRACT(year FROM crashes.crash_date) 
            ORDER BY crashes.crash_date ASC, crashes.crash_time ASC) 
            AS ytd_fatality,
        -- get ytd fatal crash, partition by year and sort by date/time.
        -- records with the same crash_id will get "tie" rankings thus making
        -- this column count each crash rather than each fatality
        DENSE_RANK() OVER (
            PARTITION BY EXTRACT(year FROM crashes.crash_date) 
            ORDER BY crashes.crash_date ASC, crashes.crash_time ASC, crashes.crash_id) 
            AS ytd_fatal_crash,
        crashes.case_id,
        crashes.law_enforcement_num
        engineering_areas.label as engineering_area,
    FROM
        fatalities f
    INNER JOIN atd_txdot_crashes crashes ON f.crash_id = crashes.crash_id
    LEFT JOIN atd_txdot_primaryperson primaryperson ON f.primaryperson_id = primaryperson.primaryperson_id
    LEFT JOIN atd_txdot_person person ON f.person_id = person.person_id
    LEFT JOIN engineering_areas ON ST_CONTAINS(engineering_areas.geometry, crashes.position)
    WHERE
        crashes.austin_full_purpose = 'Y'
    AND 
        f.is_deleted = false
);
