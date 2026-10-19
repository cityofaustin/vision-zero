-- Crash risk factors v2: rule-based view.
--
-- The rules now depend on combinations of unit, crash, location, and charge
-- attributes, which a contrib_factr -> category lookup table can't express.
-- All rule logic lives in this view and lookups.risk_factor_categories is dropped.
--
-- Output contract is unchanged: one row per crash, `id` plus `risk_factors`
-- as a sorted, de-duplicated text[] (NULL when no factors apply).
--
-- A unit "has factor X" when any of contrib_factr_1_id, contrib_factr_2_id,
-- contrib_factr_3_id, contrib_factr_p1_id, contrib_factr_p2_id equals X
-- (possible contributing factors are included). Unit-level rules are evaluated
-- per unit row, so factor, unit_desc_id, and movement_id must match on the same unit.
--
-- Not yet implemented: Access Management (needs spatial proximity to
-- intersections and driveways).
--
-- CRIS ID labels in the comments below are from CRIS lookups
-- (CONTRIB_FACTR_LKP, COLLSN_LKP, UNIT_DESC_LKP).

-- Replace the view first so it no longer depends on the lookup table.
-- Column names/types are unchanged, so CREATE OR REPLACE keeps the
-- Hasura relationship from crashes intact.
CREATE OR REPLACE VIEW crash_risk_factors_view AS
WITH
-- One row per unit per non-null, non-zero contributing factor
unit_factor_rows AS (
    SELECT
        units.crash_pk,
        units.unit_desc_id,
        units.movement_id,
        factor_ids.contrib_factor_id
    FROM
        units
    CROSS JOIN
        LATERAL(
            values
            (units.contrib_factr_1_id),
            (units.contrib_factr_2_id),
            (units.contrib_factr_3_id),
            (units.contrib_factr_p1_id),
            (units.contrib_factr_p2_id)
        ) AS factor_ids (contrib_factor_id)
    WHERE
        units.is_deleted = FALSE
        AND factor_ids.contrib_factor_id IS NOT NULL
        AND factor_ids.contrib_factor_id <> 0
),

-- Rules evaluated per unit factor row (optionally with the crash's location).
-- Each VALUES row yields a category or NULL; NULLs are filtered out.
unit_rules AS (
    SELECT
        unit_factor_rows.crash_pk AS id,
        rules.risk_factor_category
    FROM
        unit_factor_rows
    LEFT JOIN crashes
        ON crashes.id = unit_factor_rows.crash_pk
    LEFT JOIN locations
        ON locations.location_id::text = crashes.location_id
    CROSS JOIN
        LATERAL(
            values
            -- Distracted driving
            (
                CASE WHEN unit_factor_rows.contrib_factor_id IN (
                    19, -- DISTRACTION IN VEHICLE
                    20, -- DRIVER INATTENTION
                    40, -- FATIGUED OR ASLEEP
                    75, -- CELL/MOBILE DEVICE USE - TALKING
                    76, -- CELL/MOBILE DEVICE USE - TEXTING
                    77, -- CELL/MOBILE DEVICE USE - OTHER
                    78  -- CELL/MOBILE DEVICE USE - UNKNOWN
                ) THEN 'Distracted driving' END
            ),
            -- Impairment
            (
                CASE WHEN unit_factor_rows.contrib_factor_id IN (
                    45, -- HAD BEEN DRINKING
                    62, -- TAKING MEDICATION
                    67, -- INTOXICATED - ALCOHOL
                    68  -- INTOXICATED - DRUG
                ) THEN 'Impairment' END
            ),
            -- Speeding
            (
                CASE WHEN unit_factor_rows.contrib_factor_id IN (
                    22, -- FAILED TO CONTROL SPEED
                    44, -- FOLLOWED TOO CLOSELY
                    60, -- UNSAFE SPEED
                    61  -- SPEEDING - (OVERLIMIT)
                ) THEN 'Speeding' END
            ),
            -- Failure to yield - left turn
            (
                CASE
                    WHEN
                        unit_factor_rows.unit_desc_id = 1 -- MOTOR VEHICLE
                        AND unit_factor_rows.contrib_factor_id IN (
                            37, -- FAILED TO YIELD ROW - TURNING LEFT
                            63  -- TURNED IMPROPERLY - CUT CORNER ON LEFT
                        )
                        -- left turn movement
                        AND unit_factor_rows.movement_id = 1
                        THEN 'Failure to yield - left turn'
                END
            ),
            -- Failure to yield - right turn
            (
                CASE
                    WHEN
                        unit_factor_rows.unit_desc_id = 1 -- MOTOR VEHICLE
                        AND unit_factor_rows.contrib_factor_id IN (
                            38, -- FAILED TO YIELD ROW - TURN ON RED
                            64  -- TURNED IMPROPERLY - WIDE RIGHT
                        )
                        -- right turn movement
                        AND unit_factor_rows.movement_id = 2
                        THEN 'Failure to yield - right turn'
                END
            ),
            -- Failure to yield - stop or yield sign (not at a traffic signal;
            -- includes crashes with no location or no signal)
            (
                CASE
                    WHEN
                        unit_factor_rows.contrib_factor_id IN (
                            18, -- DISREGARD WARNING SIGN AT CONSTRUCTION
                            25, -- FAILED TO HEED WARNING SIGN OR TRAFFIC CONTROL DEVICE
                            29, -- FAILED TO STOP AT PROPER PLACE
                            30, -- FAILED TO STOP FOR SCHOOL BUS
                            31, -- FAILED TO STOP FOR TRAIN
                            35, -- FAILED TO YIELD ROW - STOP SIGN
                            39  -- FAILED TO YIELD ROW - YIELD SIGN
                        )
                        AND UPPER(
                            locations.signal_type
                        ) IS DISTINCT FROM 'TRAFFIC'
                        THEN 'Failure to yield - stop or yield sign'
                END
            ),
            -- Failure to yield - ran red light (at a traffic signal)
            (
                CASE
                    WHEN
                        unit_factor_rows.contrib_factor_id IN (
                            15, -- DISREGARD STOP AND GO SIGNAL
                            16  -- DISREGARD STOP SIGN OR LIGHT
                        )
                        AND UPPER(locations.signal_type) = 'TRAFFIC'
                        THEN 'Failure to yield - ran red light'
                END
            ),
            -- Failure to yield - unsafe maneuver or other
            (
                CASE
                    -- Only where there is no signal (includes crashes with no location)
                    WHEN
                        unit_factor_rows.contrib_factor_id IN (
                            3,  -- BACKED WITHOUT SAFETY
                            4,  -- CHANGED LANE WHEN UNSAFE
                            23, -- FAILED TO DRIVE IN SINGLE LANE
                            24, -- FAILED TO GIVE HALF OF ROADWAY
                            26, -- FAILED TO PASS TO LEFT SAFELY
                            27, -- FAILED TO PASS TO RIGHT SAFELY
                            32, -- FAILED TO YIELD ROW - EMERGENCY VEHICLE
                            33, -- FAILED TO YIELD ROW - OPEN INTERSECTION
                            34, -- FAILED TO YIELD ROW - PRIVATE DRIVE
                            41, -- FAULTY EVASIVE ACTION
                            51, -- OPENED DOOR INTO TRAFFIC LANE
                            53, -- OVERTAKE AND PASS INSUFFICIENT CLEARANCE
                            57, -- PASSED IN NO PASSING LANE
                            58, -- PASSED ON SHOULDER
                            69, -- WRONG SIDE - APPROACH OR INTERSECTION
                            70, -- WRONG SIDE - NOT PASSING
                            71, -- WRONG WAY - ONE WAY ROAD
                            80  -- DROVE ON IMPROVED SHOULDER
                        )
                        AND locations.signal_type IS NULL
                        THEN 'Failure to yield - unsafe maneuver or other'
                    -- Any location
                    WHEN
                        unit_factor_rows.contrib_factor_id IN (
                            17, -- DISREGARD TURN MARKS AT INTERSECTION
                            28, -- FAILED TO SIGNAL OR GAVE WRONG SIGNAL
                            65, -- TURNED IMPROPERLY - WRONG LANE
                            66, -- TURNED WHEN UNSAFE
                            79  -- FAILED TO SLOW OR MOVE OVER FOR VEHICLES DISPLAYING EMERGENCY LIGHTS
                        )
                        THEN 'Failure to yield - unsafe maneuver or other'
                END
            ),
            -- Failure to yield - vulnerable user to driver
            (
                CASE
                    -- PEDESTRIAN FAILED TO YIELD ROW TO VEHICLE
                    WHEN unit_factor_rows.contrib_factor_id = 59
                        THEN 'Failure to yield - vulnerable user to driver'
                END
            ),
            -- Failure to yield - driver to vulnerable user
            (
                CASE
                    -- FAILED TO YIELD ROW - TO PEDESTRIAN
                    WHEN unit_factor_rows.contrib_factor_id = 36
                        THEN 'Failure to yield - driver to vulnerable user'
                END
            ),
            -- Visual obstruction
            (
                CASE
                    -- IMPAIRED VISIBILITY
                    WHEN unit_factor_rows.contrib_factor_id = 48
                        THEN 'Visual obstruction'
                END
            )
        ) AS rules (risk_factor_category)
    WHERE
        rules.risk_factor_category IS NOT NULL
),

-- Rules based on crash collision type and location
crash_rules AS (
    SELECT
        crashes.id,
        rules.risk_factor_category
    FROM
        crashes
    LEFT JOIN locations
        ON locations.location_id::text = crashes.location_id
    CROSS JOIN
        LATERAL(
            values
            -- Failure to yield - left turn
            (
                CASE WHEN crashes.fhe_collsn_id IN (
                    14, -- ANGLE - ONE STRAIGHT-ONE LEFT TURN
                    34  -- OPPOSITE DIRECTION - ONE STRAIGHT-ONE LEFT TURN
                ) THEN 'Failure to yield - left turn' END
            ),
            -- Failure to yield - right turn
            (
                CASE WHEN crashes.fhe_collsn_id IN (
                    13, -- ANGLE - ONE STRAIGHT-ONE RIGHT TURN
                    33  -- OPPOSITE DIRECTION - ONE STRAIGHT-ONE RIGHT TURN
                ) THEN 'Failure to yield - right turn' END
            ),
            -- Failure to yield - ran red light
            (
                CASE
                    WHEN
                        -- ANGLE - BOTH GOING STRAIGHT
                        crashes.fhe_collsn_id = 10
                        AND UPPER(locations.signal_type) = 'TRAFFIC'
                        THEN 'Failure to yield - ran red light'
                END
            ),
            -- Failure to yield - vulnerable user to driver
            (
                CASE
                    WHEN
                        crashes.fhe_collsn_id IN (
                            1, -- ONE MOTOR VEHICLE - GOING STRAIGHT
                            2, -- ONE MOTOR VEHICLE - TURNING RIGHT
                            3  -- ONE MOTOR VEHICLE - TURNING LEFT
                        )
                        AND locations.location_group = 2
                        AND EXISTS (
                            SELECT 1
                            FROM units AS vu_units
                            WHERE
                                vu_units.crash_pk = crashes.id
                                AND vu_units.is_deleted = FALSE
                                AND vu_units.unit_desc_id IN (
                                    3,  -- PEDALCYCLIST
                                    4,  -- PEDESTRIAN
                                    177 -- VZ: micromobility (e.g. e-scooter)
                                )
                        )
                        THEN 'Failure to yield - vulnerable user to driver'
                END
            )
        ) AS rules (risk_factor_category)
    WHERE
        crashes.is_deleted = FALSE
        AND rules.risk_factor_category IS NOT NULL
),

-- Rules based on person test results
people_rules AS (
    -- Impairment
    SELECT DISTINCT
        units.crash_pk AS id,
        'Impairment'::text AS risk_factor_category
    FROM
        people
    INNER JOIN units ON units.id = people.unit_id
    WHERE
        people.is_deleted = FALSE
        AND units.is_deleted = FALSE
        AND (
            people.prsn_alc_rslt_id = 1 -- positive alcohol result
            OR people.prsn_drg_rslt_id = 1 -- positive drug result
            OR (
                -- BAC is stored as free text; match numeric values at/above 0.08
                -- e.g. '0.08', '0.15', '.12'. Skip non-numeric values like '', 'NONE'.
                people.prsn_bac_test_rslt ~ '^[0-9]*\.?[0-9]+$'
                AND people.prsn_bac_test_rslt::numeric >= 0.08
            )
        )
),

-- Rules based on charge text
charge_rules AS (
    SELECT DISTINCT
        charges_cris.crash_pk AS id,
        rules.risk_factor_category
    FROM
        charges_cris
    CROSS JOIN
        LATERAL(
            values
            -- Impairment (substring match: terms are prefixes, e.g. INFL -> INFLUENCE)
            (
                CASE
                    WHEN
                        charges_cris.charge ILIKE '%DWI%'
                        OR charges_cris.charge ILIKE '%DUI%'
                        OR charges_cris.charge ILIKE '%INTOX%'
                        OR charges_cris.charge ILIKE '%INFL%'
                        OR charges_cris.charge ILIKE '%CONTAINER%'
                        THEN 'Impairment'
                END
            ),
            -- Speeding (substring match)
            (
                CASE
                    WHEN charges_cris.charge ILIKE '%SPEED%'
                        THEN 'Speeding'
                END
            ),
            -- Failure to yield - unsafe maneuver or other
            -- Whole-word match so 'ROW' doesn't hit THROW, NARROW, etc.
            -- 'FAIL TO FIELD' is a known misspelling in source data.
            (
                CASE
                    WHEN
                        charges_cris.charge
                        ~* '\m(YIELD|FTY|ROW|FAIL TO FIELD)\M'
                        THEN 'Failure to yield - unsafe maneuver or other'
                END
            )
        ) AS rules (risk_factor_category)
    WHERE
        rules.risk_factor_category IS NOT NULL
),

-- Combine all rule outputs and remove duplicates.
-- Ex: A crash with two speeding contributing factors would result in 'Speeding' only.
all_categories AS (
    SELECT id, risk_factor_category FROM unit_rules
    UNION DISTINCT
    SELECT id, risk_factor_category FROM crash_rules
    UNION DISTINCT
    SELECT id, risk_factor_category FROM people_rules
    UNION DISTINCT
    SELECT id, risk_factor_category FROM charge_rules
),

-- Produce a list of risk factors for each crash.
-- Example:
-- id       risk_factors
-- 12345    {"Distracted driving","Speeding"}
-- 12346    {"Impairment"}
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
    NULLIF(aggregated.risk_factors, '{}'::text []) AS risk_factors
FROM
    crashes
LEFT JOIN aggregated ON aggregated.id = crashes.id;

DROP TABLE lookups.risk_factor_categories;
