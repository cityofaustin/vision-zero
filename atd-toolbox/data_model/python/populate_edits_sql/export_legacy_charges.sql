SELECT
    charge.crash_id as "Crash_ID",
    charge,
    citation_nbr,
    prsn_nbr,
    unit_nbr
FROM
    atd_txdot_charges charge
    LEFT JOIN atd_txdot_crashes atc ON charge.crash_id = atc.crash_id
WHERE
    charge NOT LIKE '%NO CHARGE%'
    AND atc.crash_date < '2014-01-01';