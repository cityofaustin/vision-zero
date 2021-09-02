--
-- Creates a view that gathers all crashes in a polygon
-- OR crashes that do not have coordinates and have city_id = 22 (Austin)
--
CREATE OR REPLACE VIEW view_atd_crashes_full_purpose AS
    (
        SELECT atc.* FROM atd_txdot_crashes AS atc
          INNER JOIN atd_jurisdictions aj
            ON ( 1=1
                AND aj.id = 11
                AND (aj.geometry && atc.position)
                AND ST_Contains(aj.geometry, atc.position)
            )
        WHERE 1=1
          AND atc.position IS NOT NULL
          AND crash_date >= concat(date_part('year', NOW()), '-01-01')::date
    ) UNION ALL (
        SELECT atc.* FROM atd_txdot_crashes AS atc
        WHERE 1=1
          AND atc.city_id = 22
          AND atc.position IS NULL
          AND crash_date >= concat(date_part('year', NOW()), '-01-01')::date
    );
