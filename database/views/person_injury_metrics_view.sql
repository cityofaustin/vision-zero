-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW person_injury_metrics_view AS SELECT
    people.id,
    units.id   AS unit_id,
    crashes.id AS crash_pk,
    crashes.cris_crash_id,
    people.years_of_life_lost,
    people.est_comp_cost_crash_based,
    CASE
        WHEN people.prsn_injry_sev_id = 0 THEN 1
        ELSE 0
    END        AS unkn_injry,
    CASE
        WHEN people.prsn_injry_sev_id = 1 THEN 1
        ELSE 0
    END        AS sus_serious_injry,
    CASE
        WHEN people.prsn_injry_sev_id = 2 THEN 1
        ELSE 0
    END        AS nonincap_injry,
    CASE
        WHEN people.prsn_injry_sev_id = 3 THEN 1
        ELSE 0
    END        AS poss_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 4 OR people.prsn_injry_sev_id = 99
            THEN 1
        ELSE 0
    END        AS fatal_injury,
    CASE
        WHEN people.prsn_injry_sev_id = 4 THEN 1
        ELSE 0
    END        AS vz_fatal_injury,
    CASE
        WHEN
            (people.prsn_injry_sev_id = 4 OR people.prsn_injry_sev_id = 99)
            AND crashes.law_enforcement_ytd_fatality_num IS NOT NULL
            THEN 1
        ELSE 0
    END        AS law_enf_fatal_injury,
    CASE
        WHEN people_cris.prsn_injry_sev_id = 4 THEN 1
        ELSE 0
    END        AS cris_fatal_injury,
    CASE
        WHEN people.prsn_injry_sev_id = 5 THEN 1
        ELSE 0
    END        AS non_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 4
            AND (units.vz_mode_category_id = ANY(ARRAY[1, 2, 4]))
            THEN 1
        ELSE 0
    END        AS motor_vehicle_fatal_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 1
            AND (units.vz_mode_category_id = ANY(ARRAY[1, 2, 4]))
            THEN 1
        ELSE 0
    END        AS motor_vehicle_sus_serious_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 4 AND units.vz_mode_category_id = 3
            THEN 1
        ELSE 0
    END        AS motorcycle_fatal_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 1 AND units.vz_mode_category_id = 3
            THEN 1
        ELSE 0
    END        AS motorycle_sus_serious_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 4 AND units.vz_mode_category_id = 5
            THEN 1
        ELSE 0
    END        AS bicycle_fatal_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 1 AND units.vz_mode_category_id = 5
            THEN 1
        ELSE 0
    END        AS bicycle_sus_serious_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 4 AND units.vz_mode_category_id = 7
            THEN 1
        ELSE 0
    END        AS pedestrian_fatal_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 1 AND units.vz_mode_category_id = 7
            THEN 1
        ELSE 0
    END        AS pedestrian_sus_serious_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 4 AND units.vz_mode_category_id = 11
            THEN 1
        ELSE 0
    END        AS micromobility_fatal_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 1 AND units.vz_mode_category_id = 11
            THEN 1
        ELSE 0
    END        AS micromobility_sus_serious_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 4
            AND (units.vz_mode_category_id = ANY(ARRAY[6, 8, 9]))
            THEN 1
        ELSE 0
    END        AS other_fatal_injry,
    CASE
        WHEN
            people.prsn_injry_sev_id = 1
            AND (units.vz_mode_category_id = ANY(ARRAY[6, 8, 9]))
            THEN 1
        ELSE 0
    END        AS other_sus_serious_injry
FROM people people
LEFT JOIN units units ON people.unit_id = units.id
LEFT JOIN people_cris people_cris ON people.id = people_cris.id
LEFT JOIN crashes crashes ON units.crash_pk = crashes.id
WHERE people.is_deleted = FALSE;
