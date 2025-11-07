CREATE OR REPLACE VIEW unit_types_involved_view AS
WITH
    unit_types AS (
        SELECT
            crash_pk,
            CASE
                WHEN unit_desc_id = 3 THEN 'Bicycle'
                WHEN unit_desc_id = 4 THEN 'Pedestrian'
                WHEN veh_body_styl_id = 71
                OR veh_body_styl_id = 90 THEN 'Motorcycle'
                WHEN veh_body_styl_id = 177 THEN 'E-Scooter'
                WHEN unit_desc_id = 1
                AND veh_body_styl_id IN (9, 23, 30, 47, 69, 100, 103, 104, 105, 106, 107, 109) THEN 'Car'
                ELSE 'Other'
            END AS unit_type
        FROM
            units
        WHERE
            units.is_deleted = false
    ),
    distinct_unit_types AS (
        SELECT
            crash_pk,
            unit_type,
            COUNT(*) AS unit_count
        FROM
            unit_types
        GROUP BY
            crash_pk,
            unit_type
    ),
    crash_summaries AS (
        SELECT
            crash_pk,
            ARRAY_AGG(
                unit_type
                ORDER BY
                    unit_type
            ) AS unit_types_array,
            SUM(unit_count) AS total_units
        FROM
            distinct_unit_types
        GROUP BY
            crash_pk
    )
SELECT
    crash_pk,
    CASE
        WHEN total_units = 1::numeric THEN 'Single ' || unit_types_array[1]
        WHEN total_units > 1::numeric AND array_length(unit_types_array, 1) = 1::numeric
            then unit_types_array[1] || '/' || unit_types_array[1]
        ELSE ARRAY_TO_STRING(unit_types_array, '/')
    END AS unit_types_involved
FROM
    crash_summaries;
