-- Mapping of CRIS contrib_factr IDs to Vision Zero crash-level risk factors.
-- Source: Crash contributing factors business rules: https://docs.google.com/document/d/1YPVyAz72YUMo-kMvN65dMjN7DKba6OEqGJGQWMTwWAc/edit?tab=t.0#heading=h.5wz64nv7k8b0
-- Note: CRIS id 72 (CELL/MOBILE PHONE USE) was removed in CRIS v30.1; use 75–78.
CREATE TABLE lookups.risk_factor_categories (
    contrib_factor_id integer NOT NULL REFERENCES lookups.contrib_factr (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    risk_factor_category text NOT NULL,
    PRIMARY KEY (contrib_factor_id, risk_factor_category)
);

-- Ensure referenced CRIS lookup rows exist (no-op when already loaded from a dump).
INSERT INTO lookups.contrib_factr (id, label, source)
VALUES
    (3, 'BACKED WITHOUT SAFETY', 'cris'),
    (4, 'CHANGED LANE WHEN UNSAFE', 'cris'),
    (15, 'DISREGARD STOP AND GO SIGNAL', 'cris'),
    (16, 'DISREGARD STOP SIGN OR LIGHT', 'cris'),
    (17, 'DISREGARD TURN MARKS AT INTERSECTION', 'cris'),
    (18, 'DISREGARD WARNING SIGN AT CONSTRUCTION', 'cris'),
    (19, 'DISTRACTION IN VEHICLE', 'cris'),
    (20, 'DRIVER INATTENTION', 'cris'),
    (22, 'FAILED TO CONTROL SPEED', 'cris'),
    (23, 'FAILED TO DRIVE IN SINGLE LANE', 'cris'),
    (24, 'FAILED TO GIVE HALF OF ROADWAY', 'cris'),
    (25, 'FAILED TO HEED WARNING SIGN OR TRAFFIC CONTROL DEVICE', 'cris'),
    (26, 'FAILED TO PASS TO LEFT SAFELY', 'cris'),
    (27, 'FAILED TO PASS TO RIGHT SAFELY', 'cris'),
    (28, 'FAILED TO SIGNAL OR GAVE WRONG SIGNAL', 'cris'),
    (29, 'FAILED TO STOP AT PROPER PLACE', 'cris'),
    (30, 'FAILED TO STOP FOR SCHOOL BUS', 'cris'),
    (31, 'FAILED TO STOP FOR TRAIN', 'cris'),
    (32, 'FAILED TO YIELD RIGHT OF WAY - EMERGENCY VEHICLE', 'cris'),
    (33, 'FAILED TO YIELD RIGHT OF WAY - OPEN INTERSECTION', 'cris'),
    (34, 'FAILED TO YIELD RIGHT OF WAY - PRIVATE DRIVE', 'cris'),
    (35, 'FAILED TO YIELD RIGHT OF WAY - STOP SIGN', 'cris'),
    (36, 'FAILED TO YIELD RIGHT OF WAY - TO PEDESTRIAN', 'cris'),
    (37, 'FAILED TO YIELD RIGHT OF WAY - TURNING LEFT', 'cris'),
    (38, 'FAILED TO YIELD RIGHT OF WAY - TURN ON RED', 'cris'),
    (39, 'FAILED TO YIELD RIGHT OF WAY - YIELD SIGN', 'cris'),
    (40, 'FATIGUED OR ASLEEP', 'cris'),
    (41, 'FAULTY EVASIVE ACTION', 'cris'),
    (44, 'FOLLOWED TOO CLOSELY', 'cris'),
    (45, 'HAD BEEN DRINKING', 'cris'),
    (48, 'IMPAIRED VISIBILITY (EXPLAIN IN NARRATIVE)', 'cris'),
    (51, 'OPENED DOOR INTO TRAFFIC LANE', 'cris'),
    (53, 'OVERTAKE AND PASS INSUFFICIENT CLEARANCE', 'cris'),
    (57, 'PASSED IN NO PASSING LANE', 'cris'),
    (58, 'PASSED ON SHOULDER', 'cris'),
    (59, 'PEDESTRIAN FAILED TO YIELD RIGHT OF WAY TO VEHICLE', 'cris'),
    (60, 'UNSAFE SPEED', 'cris'),
    (61, 'SPEEDING - (OVERLIMIT)', 'cris'),
    (62, 'TAKING MEDICATION (EXPLAIN IN NARRATIVE)', 'cris'),
    (63, 'TURNED IMPROPERLY - CUT CORNER ON LEFT', 'cris'),
    (64, 'TURNED IMPROPERLY - WIDE RIGHT', 'cris'),
    (65, 'TURNED IMPROPERLY - WRONG LANE', 'cris'),
    (66, 'TURNED WHEN UNSAFE', 'cris'),
    (67, 'INTOXICATED - ALCOHOL', 'cris'),
    (68, 'INTOXICATED - DRUG', 'cris'),
    (69, 'WRONG SIDE - APPROACH OR INTERSECTION', 'cris'),
    (70, 'WRONG SIDE - NOT PASSING', 'cris'),
    (71, 'WRONG WAY - ONE WAY ROAD', 'cris'),
    (75, 'CELL/MOBILE DEVICE USE - TALKING', 'cris'),
    (76, 'CELL/MOBILE DEVICE USE - TEXTING', 'cris'),
    (77, 'CELL/MOBILE DEVICE USE - OTHER', 'cris'),
    (78, 'CELL/MOBILE DEVICE USE - UNKNOWN', 'cris'),
    (79, 'FAILED TO SLOW OR MOVE OVER FOR VEHICLES DISPLAYING EMERGENCY LIGHTS', 'cris'),
    (80, 'DROVE ON IMPROVED SHOULDER', 'cris')
ON CONFLICT (id) DO NOTHING;

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
