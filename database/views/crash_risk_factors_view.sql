-- Most recent migration: database/migrations/default/1792163358198_crash_risk_factors_v2/up.sql

CREATE OR REPLACE VIEW crash_risk_factors_view AS
WITH unit_factor_rows AS (
    SELECT
        units.crash_pk,
        units.unit_desc_id,
        units.movement_id,
        factor_ids.contrib_factor_id
    FROM units
    CROSS JOIN
        LATERAL (
            VALUES (units.contrib_factr_1_id),
            (units.contrib_factr_2_id),
            (units.contrib_factr_3_id),
            (units.contrib_factr_p1_id),
            (units.contrib_factr_p2_id)
        ) factor_ids (contrib_factor_id)
    WHERE
        units.is_deleted = false
        AND factor_ids.contrib_factor_id IS NOT null
        AND factor_ids.contrib_factor_id <> 0
),

unit_rules AS (
    SELECT
        unit_factor_rows.crash_pk AS id,
        rules.risk_factor_category
    FROM unit_factor_rows
    LEFT JOIN crashes crashes_1 ON crashes_1.id = unit_factor_rows.crash_pk
    LEFT JOIN locations ON locations.location_id::text = crashes_1.location_id
    CROSS JOIN
        LATERAL (VALUES (
            CASE
                WHEN
                    unit_factor_rows.contrib_factor_id = ANY(ARRAY[19, 20, 40, 75, 76, 77, 78])
                    THEN 'Distracted driving'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    unit_factor_rows.contrib_factor_id = ANY(ARRAY[45, 62, 67, 68])
                    THEN 'Impairment'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    unit_factor_rows.contrib_factor_id = ANY(ARRAY[22, 44, 60, 61])
                    THEN 'Speeding'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    unit_factor_rows.unit_desc_id = 1
                    AND (unit_factor_rows.contrib_factor_id = ANY(ARRAY[37, 63]))
                    AND unit_factor_rows.movement_id = 1
                    THEN 'Failure to yield - left turn'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    unit_factor_rows.unit_desc_id = 1
                    AND (unit_factor_rows.contrib_factor_id = ANY(ARRAY[38, 64]))
                    AND unit_factor_rows.movement_id = 2
                    THEN 'Failure to yield - right turn'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    (unit_factor_rows.contrib_factor_id = ANY(ARRAY[18, 25, 29, 30, 31, 35, 39]))
                    AND UPPER(locations.signal_type) IS DISTINCT FROM 'TRAFFIC'::text
                    THEN 'Failure to yield - stop or yield sign'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    (unit_factor_rows.contrib_factor_id = ANY(ARRAY[15, 16]))
                    AND UPPER(locations.signal_type) = 'TRAFFIC'::text
                    THEN 'Failure to yield - ran red light'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    (
                        unit_factor_rows.contrib_factor_id
                        = ANY(
                            ARRAY[
                                3, 4, 23, 24, 26, 27, 32, 33, 34, 41, 51, 53, 57, 58, 69, 70, 71, 80
                            ]
                        )
                    )
                    AND locations.signal_type IS null
                    THEN 'Failure to yield - unsafe maneuver or other'::text
                WHEN
                    unit_factor_rows.contrib_factor_id = ANY(ARRAY[17, 28, 65, 66, 79])
                    THEN 'Failure to yield - unsafe maneuver or other'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    unit_factor_rows.contrib_factor_id = 59
                    THEN 'Failure to yield - vulnerable user to driver'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    unit_factor_rows.contrib_factor_id = 36
                    THEN 'Failure to yield - driver to vulnerable user'::text
                ELSE null::text
            END), (
            CASE
                WHEN unit_factor_rows.contrib_factor_id = 48 THEN 'Visual obstruction'::text
                ELSE null::text
            END
        )) rules (risk_factor_category)
    WHERE rules.risk_factor_category IS NOT null
),

crash_rules AS (
    SELECT
        crashes_1.id,
        rules.risk_factor_category
    FROM crashes crashes_1
    LEFT JOIN locations ON locations.location_id::text = crashes_1.location_id
    CROSS JOIN
        LATERAL (VALUES (
            CASE
                WHEN
                    crashes_1.fhe_collsn_id = ANY(ARRAY[14, 34])
                    THEN 'Failure to yield - left turn'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    crashes_1.fhe_collsn_id = ANY(ARRAY[13, 33])
                    THEN 'Failure to yield - right turn'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    crashes_1.fhe_collsn_id = 10 AND UPPER(locations.signal_type) = 'TRAFFIC'::text
                    THEN 'Failure to yield - ran red light'::text
                ELSE null::text
            END), (
            CASE
                WHEN (crashes_1.fhe_collsn_id = ANY(
                    ARRAY[1, 2, 3]
                )) AND locations.location_group = 2 AND (
                    EXISTS (
                        SELECT 1
                        FROM units vu_units
                        WHERE
                            vu_units.crash_pk = crashes_1.id
                            AND vu_units.is_deleted = false
                            AND (vu_units.unit_desc_id = ANY(ARRAY[3, 4, 177]))
                    )
                )
                    THEN 'Failure to yield - vulnerable user to driver'::text
                ELSE null::text
            END
        )) rules (risk_factor_category)
    WHERE crashes_1.is_deleted = false AND rules.risk_factor_category IS NOT null
),

people_rules AS (
    SELECT DISTINCT
        units.crash_pk     AS id,
        'Impairment'::text AS risk_factor_category
    FROM people
    INNER JOIN units ON units.id = people.unit_id
    WHERE
        people.is_deleted = false
        AND units.is_deleted = false
        AND (
            people.prsn_alc_rslt_id = 1
            OR people.prsn_drg_rslt_id = 1
            OR people.prsn_bac_test_rslt ~ '^[0-9]*\.?[0-9]+$'::text
            AND people.prsn_bac_test_rslt::numeric >= 0.08
        )
),

charge_rules AS (
    SELECT DISTINCT
        charges_cris.crash_pk AS id,
        rules.risk_factor_category
    FROM charges_cris
    CROSS JOIN
        LATERAL (VALUES (
            CASE
                WHEN
                    charges_cris.charge ~~* '%DWI%'::text
                    OR charges_cris.charge ~~* '%DUI%'::text
                    OR charges_cris.charge ~~* '%INTOX%'::text
                    OR charges_cris.charge ~~* '%INFL%'::text
                    OR charges_cris.charge ~~* '%CONTAINER%'::text
                    THEN 'Impairment'::text
                ELSE null::text
            END), (
            CASE
                WHEN charges_cris.charge ~~* '%SPEED%'::text THEN 'Speeding'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    charges_cris.charge ~* '\mran\s*red\s*light\M'::text
                    THEN 'Failure to yield - ran red light'::text
                ELSE null::text
            END), (
            CASE
                WHEN
                    charges_cris.charge ~* '\m(YIELD|FTY|ROW|FAIL TO FIELD)\M'::text
                    THEN 'Failure to yield - unsafe maneuver or other'::text
                ELSE null::text
            END
        )) rules (risk_factor_category)
    WHERE rules.risk_factor_category IS NOT null
),

all_categories AS (
    SELECT
        unit_rules.id,
        unit_rules.risk_factor_category
    FROM unit_rules
    UNION
    SELECT
        crash_rules.id,
        crash_rules.risk_factor_category
    FROM crash_rules
    UNION
    SELECT
        people_rules.id,
        people_rules.risk_factor_category
    FROM people_rules
    UNION
    SELECT
        charge_rules.id,
        charge_rules.risk_factor_category
    FROM charge_rules
),

aggregated AS (
    SELECT
        all_categories.id,
        ARRAY_AGG(
            DISTINCT all_categories.risk_factor_category
            ORDER BY all_categories.risk_factor_category
        ) AS risk_factors
    FROM all_categories
    GROUP BY all_categories.id
)

SELECT
    crashes.id,
    NULLIF(aggregated.risk_factors, '{}'::text[]) AS risk_factors
FROM crashes
LEFT JOIN aggregated ON aggregated.id = crashes.id;
