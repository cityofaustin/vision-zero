-- Mapping of CRIS contrib_factr IDs to Vision Zero crash-level risk factors.
-- Source: Crash contributing factors business rules: https://docs.google.com/document/d/1YPVyAz72YUMo-kMvN65dMjN7DKba6OEqGJGQWMTwWAc/edit?tab=t.0#heading=h.5wz64nv7k8b0
-- Note: CRIS id 72 (CELL/MOBILE PHONE USE) was removed in CRIS v30.1; use 75–78.
CREATE TABLE lookups.risk_factor_categories (
    contrib_factor_id integer NOT NULL REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    risk_factor_category text NOT NULL,
    source text DEFAULT 'vz'::text NOT NULL,
    PRIMARY KEY (contrib_factor_id, risk_factor_category)
);

COMMENT ON TABLE lookups.risk_factor_categories IS
'Maps CRIS contributing factor IDs to Vision Zero crash-level risk factor categories.';

INSERT INTO lookups.risk_factor_categories (contrib_factor_id, risk_factor_category)
VALUES
    -- Distracted driving
    (19, 'Distracted driving'),
    (20, 'Distracted driving'),
    (40, 'Distracted driving'),
    (75, 'Distracted driving'),
    (76, 'Distracted driving'),
    (77, 'Distracted driving'),
    (78, 'Distracted driving'),
    -- Failure to yield
    (3, 'Failure to yield'),
    (4, 'Failure to yield'),
    (17, 'Failure to yield'),
    (18, 'Failure to yield'),
    (23, 'Failure to yield'),
    (24, 'Failure to yield'),
    (25, 'Failure to yield'),
    (26, 'Failure to yield'),
    (27, 'Failure to yield'),
    (28, 'Failure to yield'),
    (29, 'Failure to yield'),
    (30, 'Failure to yield'),
    (31, 'Failure to yield'),
    (32, 'Failure to yield'),
    (33, 'Failure to yield'),
    (34, 'Failure to yield'),
    (35, 'Failure to yield'),
    (36, 'Failure to yield'),
    (37, 'Failure to yield'),
    (38, 'Failure to yield'),
    (39, 'Failure to yield'),
    (41, 'Failure to yield'),
    (51, 'Failure to yield'),
    (53, 'Failure to yield'),
    (57, 'Failure to yield'),
    (58, 'Failure to yield'),
    (59, 'Failure to yield'),
    (63, 'Failure to yield'),
    (64, 'Failure to yield'),
    (65, 'Failure to yield'),
    (66, 'Failure to yield'),
    (69, 'Failure to yield'),
    (70, 'Failure to yield'),
    (71, 'Failure to yield'),
    (79, 'Failure to yield'),
    (80, 'Failure to yield'),
    -- Impaired driving
    (45, 'Impaired driving'),
    (62, 'Impaired driving'),
    (67, 'Impaired driving'),
    (68, 'Impaired driving'),
    -- Red light running
    (15, 'Red light running'),
    (16, 'Red light running'),
    -- Speeding
    (22, 'Speeding'),
    (44, 'Speeding'),
    (60, 'Speeding'),
    (61, 'Speeding'),
    -- Visual obstruction
    (48, 'Visual obstruction');

CREATE OR REPLACE VIEW crash_risk_factors_view AS
WITH
    unit_factors AS (
        SELECT
            units.crash_pk AS id,
            categories.risk_factor_category
        FROM
            units
            CROSS JOIN LATERAL (
                VALUES
                    (units.contrib_factr_1_id),
                    (units.contrib_factr_2_id),
                    (units.contrib_factr_3_id),
                    (units.contrib_factr_p1_id),
                    (units.contrib_factr_p2_id)
            ) AS factor_ids (contrib_factor_id)
            INNER JOIN lookups.risk_factor_categories AS categories
                ON categories.contrib_factor_id = factor_ids.contrib_factor_id
        WHERE
            units.is_deleted = FALSE
            AND factor_ids.contrib_factor_id IS NOT NULL
            AND factor_ids.contrib_factor_id <> 0
    ),
    attribute_factors AS (
        -- Impaired driving from people alcohol/drug test results or BAC
        SELECT DISTINCT
            units.crash_pk AS id,
            'Impaired driving'::text AS risk_factor_category
        FROM
            people
            INNER JOIN units ON units.id = people.unit_id
        WHERE
            people.is_deleted = FALSE
            AND units.is_deleted = FALSE
            AND (
                people.prsn_alc_rslt_id = 1
                OR people.prsn_drg_rslt_id = 1
                OR (
                    -- BAC is stored as free text; match numeric values at/above 0.08
                    -- e.g. '0.08', '0.15', '.12'. Skip non-numeric values like '', 'NONE'.
                    people.prsn_bac_test_rslt ~ '^[0-9]*\.?[0-9]+$'
                    AND people.prsn_bac_test_rslt::numeric >= 0.08
                )
            )
        UNION
        -- Impaired driving from charges
        SELECT DISTINCT
            charges_cris.crash_pk AS id,
            'Impaired driving'::text AS risk_factor_category
        FROM
            charges_cris
        WHERE
            charges_cris.charge ILIKE '%DWI%'
            OR charges_cris.charge ILIKE '%DUI%'
            OR charges_cris.charge ILIKE '%INTOX%'
            OR charges_cris.charge ILIKE '%INFL%'
            OR charges_cris.charge ILIKE '%CONTAINER%'
        UNION
        -- Speeding from charges
        SELECT DISTINCT
            charges_cris.crash_pk AS id,
            'Speeding'::text AS risk_factor_category
        FROM
            charges_cris
        WHERE
            charges_cris.charge ILIKE '%SPEED%'
        UNION
        -- Red light running from collision type + signalized location
        SELECT
            crashes.id,
            'Red light running'::text AS risk_factor_category
        FROM
            crashes
            INNER JOIN locations
                ON locations.location_id::text = crashes.location_id
        WHERE
            crashes.fhe_collsn_id = 10
            AND locations.signal_type ILIKE 'TRAFFIC'
    ),
    -- Combine unit and attribute factors and remove duplicates.
    -- Ex: A crash with two speeding contributing factors would result in 'Speeding' only.
    all_categories AS (
        SELECT
            id,
            risk_factor_category
        FROM
            unit_factors
        UNION
        SELECT
            id,
            risk_factor_category
        FROM
            attribute_factors
    ),
    -- Produce a list of risk factors for each crash.
    -- Example:
    -- id       risk_factors
    -- 12345    {"Distracted driving","Speeding"}
    -- 12346    {"Impaired driving"}
    -- 12347    null
    aggregated AS (
        SELECT
            id,
            ARRAY_AGG(
                DISTINCT risk_factor_category
                ORDER BY
                    risk_factor_category
            ) AS risk_factors
        FROM
            all_categories
        GROUP BY
            id
    )
SELECT
    crashes.id,
    NULLIF(aggregated.risk_factors, '{}'::text[]) AS risk_factors
FROM
    crashes
    LEFT JOIN aggregated ON aggregated.id = crashes.id;
