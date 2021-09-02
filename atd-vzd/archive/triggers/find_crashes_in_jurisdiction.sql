--
-- Finds crashes within a jurisdiction and two dates.
--
CREATE OR REPLACE FUNCTION find_crashes_in_jurisdiction(jurisdiction_id int, crash_date_min date, crash_date_max date)
RETURNS SETOF atd_txdot_crashes AS $$
    (
        SELECT atc.* FROM atd_txdot_crashes AS atc
          INNER JOIN atd_jurisdictions aj
            ON ( 1=1
                AND aj.id = jurisdiction_id
                AND (aj.geometry && atc.position)
                AND ST_Contains(aj.geometry, atc.position)
            )
        WHERE 1=1
          AND atc.position IS NOT NULL
          AND atc.crash_date >= crash_date_min
          AND atc.crash_date <= crash_date_max
    ) UNION ALL (
        SELECT atc.* FROM atd_txdot_crashes AS atc
        WHERE 1=1
          AND atc.city_id = 22
          AND atc.position IS NULL
          AND atc.crash_date >= crash_date_min
          AND atc.crash_date <= crash_date_max
    )
$$ LANGUAGE sql STABLE;
