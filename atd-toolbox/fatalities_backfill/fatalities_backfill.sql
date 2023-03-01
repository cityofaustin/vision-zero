-- This is a one time script to populate the fatalities table with historical data

INSERT INTO fatalities (crash_id, primaryperson_id, location, year)
SELECT atd_txdot_primaryperson.crash_id, primaryperson_id, CONCAT_WS(' ', rpt_block_num, rpt_street_pfx, rpt_street_name, '(', rpt_sec_block_num, rpt_sec_street_pfx, rpt_sec_street_name, ')'), TO_CHAR(crash_date,'yyyy')
FROM atd_txdot_primaryperson
JOIN atd_txdot_crashes ON atd_txdot_primaryperson.crash_id = atd_txdot_crashes.crash_id
WHERE prsn_injry_sev_id = 4;

INSERT INTO fatalities (crash_id, person_id, location, year)
SELECT atd_txdot_person.crash_id, person_id, CONCAT_WS(' ', rpt_block_num, rpt_street_pfx, rpt_street_name, '(', rpt_sec_block_num, rpt_sec_street_pfx, rpt_sec_street_name, ')'), TO_CHAR(crash_date,'yyyy')
FROM atd_txdot_person
JOIN atd_txdot_crashes ON atd_txdot_person.crash_id = atd_txdot_crashes.crash_id
WHERE prsn_injry_sev_id = 4;