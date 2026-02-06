-- Most recent migration: database/migrations/default/1761935469547_units_invloved/up.sql

CREATE OR REPLACE VIEW unit_types_involved_view AS WITH unit_types AS (
    SELECT
        units.crash_pk,
        CASE
            WHEN units.unit_desc_id = 3 THEN 'Bicycle'::text
            WHEN units.unit_desc_id = 4 THEN 'Pedestrian'::text
            WHEN units.veh_body_styl_id = 71 OR units.veh_body_styl_id = 90 THEN 'Motorcycle'::text
            WHEN units.veh_body_styl_id = 177 THEN 'E-Scooter'::text
            WHEN
                units.unit_desc_id = 1
                AND (
                    units.veh_body_styl_id
                    = ANY(ARRAY[0, 9, 23, 30, 47, 69, 87, 92, 100, 103, 104, 105, 106, 107, 109])
                )
                THEN 'Car'::text
            WHEN units.unit_desc_id = 1 AND units.veh_body_styl_id IS NULL THEN 'Car'::text
            WHEN units.unit_desc_id = 6 THEN 'Car'::text
            ELSE 'Other'::text
        END AS unit_type
    FROM units
    WHERE units.is_deleted = FALSE
),

distinct_unit_types AS (
    SELECT
        unit_types.crash_pk,
        unit_types.unit_type,
        COUNT(*) AS unit_count
    FROM unit_types
    GROUP BY unit_types.crash_pk, unit_types.unit_type
),

crash_summaries AS (
    SELECT
        distinct_unit_types.crash_pk,
        ARRAY_AGG(
            distinct_unit_types.unit_type ORDER BY distinct_unit_types.unit_type
        )                                   AS unit_types_array,
        SUM(distinct_unit_types.unit_count) AS total_units
    FROM distinct_unit_types
    GROUP BY distinct_unit_types.crash_pk
)

SELECT
    crash_pk,
    CASE
        WHEN total_units = 1::numeric THEN 'Single '::text || unit_types_array[1]
        WHEN
            total_units > 1::numeric AND ARRAY_LENGTH(unit_types_array, 1)::numeric = 1::numeric
            THEN (unit_types_array[1] || '/'::text) || unit_types_array[1]
        ELSE ARRAY_TO_STRING(unit_types_array, '/'::text)
    END AS unit_types_involved
FROM crash_summaries;
