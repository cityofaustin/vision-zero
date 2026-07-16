-- Most recent migration: database/migrations/default/1784227413000_crash_risk_factors/up.sql

CREATE OR REPLACE VIEW crash_risk_factors_view AS
WITH unit_factors AS (
    SELECT
        units.crash_pk AS id,
        categories.risk_factor_category
    FROM units
    CROSS JOIN LATERAL
        (
            VALUES (units.contrib_factr_1_id),
            (units.contrib_factr_2_id),
            (units.contrib_factr_3_id),
            (units.contrib_factr_p1_id),
            (units.contrib_factr_p2_id)
        ) factor_ids (contrib_factor_id)
    INNER JOIN
        lookups.risk_factor_categories categories
        ON categories.contrib_factor_id = factor_ids.contrib_factor_id
    WHERE
        units.is_deleted = false
        AND factor_ids.contrib_factor_id IS NOT null
        AND factor_ids.contrib_factor_id <> 0
),

attribute_factors AS (
    SELECT DISTINCT
        units.crash_pk           AS id,
        'Impaired driving'::text AS risk_factor_category
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
    UNION
    SELECT DISTINCT
        charges_cris.crash_pk    AS id,
        'Impaired driving'::text AS risk_factor_category
    FROM charges_cris
    WHERE
        charges_cris.charge ~~* '%DWI%'::text
        OR charges_cris.charge ~~* '%DUI%'::text
        OR charges_cris.charge ~~* '%INTOX%'::text
        OR charges_cris.charge ~~* '%INFL%'::text
        OR charges_cris.charge ~~* '%CONTAINER%'::text
    UNION
    SELECT DISTINCT
        charges_cris.crash_pk AS id,
        'Speeding'::text      AS risk_factor_category
    FROM charges_cris
    WHERE charges_cris.charge ~~* '%SPEED%'::text
    UNION
    SELECT
        crashes_1.id,
        'Red light running'::text AS risk_factor_category
    FROM crashes crashes_1
    INNER JOIN locations ON locations.location_id::text = crashes_1.location_id
    WHERE crashes_1.fhe_collsn_id = 10 AND locations.signal_type ~~* 'TRAFFIC'::text
),

all_categories AS (
    SELECT
        unit_factors.id,
        unit_factors.risk_factor_category
    FROM unit_factors
    UNION
    SELECT
        attribute_factors.id,
        attribute_factors.risk_factor_category
    FROM attribute_factors
),

aggregated AS (
    SELECT
        all_categories.id,
        array_agg(
            DISTINCT all_categories.risk_factor_category
            ORDER BY all_categories.risk_factor_category
        ) AS risk_factors
    FROM all_categories
    GROUP BY all_categories.id
)

SELECT
    crashes.id,
    nullif(aggregated.risk_factors, '{}'::text []) AS risk_factors
FROM crashes
LEFT JOIN aggregated ON aggregated.id = crashes.id;
