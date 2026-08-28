-- Most recent migration: 

CREATE OR REPLACE VIEW combined_person_injury_metrics_view AS
WITH people_with_ems_overrides AS (
    SELECT
        people.id,
        units.id                      AS unit_id,
        crashes.id                    AS crash_pk,
        crashes.cris_crash_id,
        units.vz_mode_category_id,
        people.years_of_life_lost,
        people.est_comp_cost_crash_based,
        people.prsn_injry_sev_id,
        ems.patient_injry_sev_id,
        CASE
            WHEN people.prsn_injry_sev_id = 4 THEN 4
            WHEN people.prsn_injry_sev_id = 99 THEN 99
            WHEN ems.patient_injry_sev_id IS NOT NULL THEN ems.patient_injry_sev_id
            ELSE people.prsn_injry_sev_id
        END                           AS combined_inj_sev_id,
        crashes.law_enforcement_ytd_fatality_num,
        people_cris.prsn_injry_sev_id AS cris_prsn_injry_sev_id,
        CASE
            WHEN ems.id IS NOT NULL THEN 'crash_report_and_ems'::text
            ELSE 'crash_report'::text
        END                           AS record_source
    FROM people people
    LEFT JOIN units units ON people.unit_id = units.id
    LEFT JOIN crashes crashes ON units.crash_pk = crashes.id
    LEFT JOIN people_cris people_cris ON people.id = people_cris.id
    LEFT JOIN
        ems__incidents ems
        ON people.id = ems.person_id AND (ems.id IS NULL OR ems.is_deleted = FALSE)
    WHERE people.is_deleted = FALSE
),

people_injury_metrics_with_overrides AS (
    SELECT
        people_with_ems_overrides.id,
        people_with_ems_overrides.unit_id,
        people_with_ems_overrides.crash_pk,
        people_with_ems_overrides.cris_crash_id,
        people_with_ems_overrides.record_source,
        people_with_ems_overrides.years_of_life_lost,
        people_with_ems_overrides.est_comp_cost_crash_based,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 1
                AND people_with_ems_overrides.prsn_injry_sev_id <> 1
                THEN 1
            ELSE 0
        END AS upgrade_to_sus_serious_injry,
        CASE
            WHEN
                people_with_ems_overrides.prsn_injry_sev_id = 1
                AND (people_with_ems_overrides.combined_inj_sev_id = ANY(ARRAY[2, 3, 5]))
                THEN 1
            ELSE 0
        END AS downgrade_from_sus_serious_injry,
        CASE
            WHEN people_with_ems_overrides.combined_inj_sev_id = 0 THEN 1
            ELSE 0
        END AS unkn_injry,
        CASE
            WHEN people_with_ems_overrides.combined_inj_sev_id = 1 THEN 1
            ELSE 0
        END AS sus_serious_injry,
        CASE
            WHEN people_with_ems_overrides.combined_inj_sev_id = 2 THEN 1
            ELSE 0
        END AS nonincap_injry,
        CASE
            WHEN people_with_ems_overrides.combined_inj_sev_id = 3 THEN 1
            ELSE 0
        END AS poss_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 4
                OR people_with_ems_overrides.combined_inj_sev_id = 99
                THEN 1
            ELSE 0
        END AS fatal_injury,
        CASE
            WHEN people_with_ems_overrides.combined_inj_sev_id = 4 THEN 1
            ELSE 0
        END AS vz_fatal_injury,
        CASE
            WHEN
                (
                    people_with_ems_overrides.combined_inj_sev_id = 4
                    OR people_with_ems_overrides.combined_inj_sev_id = 99
                )
                AND people_with_ems_overrides.law_enforcement_ytd_fatality_num IS NOT NULL
                THEN 1
            ELSE 0
        END AS law_enf_fatal_injury,
        CASE
            WHEN people_with_ems_overrides.cris_prsn_injry_sev_id = 4 THEN 1
            ELSE 0
        END AS cris_fatal_injury,
        CASE
            WHEN people_with_ems_overrides.combined_inj_sev_id = 5 THEN 1
            ELSE 0
        END AS non_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 4
                AND (people_with_ems_overrides.vz_mode_category_id = ANY(ARRAY[1, 2, 4]))
                THEN 1
            ELSE 0
        END AS motor_vehicle_fatal_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 1
                AND (people_with_ems_overrides.vz_mode_category_id = ANY(ARRAY[1, 2, 4]))
                THEN 1
            ELSE 0
        END AS motor_vehicle_sus_serious_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 4
                AND people_with_ems_overrides.vz_mode_category_id = 3
                THEN 1
            ELSE 0
        END AS motorcycle_fatal_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 1
                AND people_with_ems_overrides.vz_mode_category_id = 3
                THEN 1
            ELSE 0
        END AS motorycle_sus_serious_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 4
                AND people_with_ems_overrides.vz_mode_category_id = 5
                THEN 1
            ELSE 0
        END AS bicycle_fatal_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 1
                AND people_with_ems_overrides.vz_mode_category_id = 5
                THEN 1
            ELSE 0
        END AS bicycle_sus_serious_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 4
                AND people_with_ems_overrides.vz_mode_category_id = 7
                THEN 1
            ELSE 0
        END AS pedestrian_fatal_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 1
                AND people_with_ems_overrides.vz_mode_category_id = 7
                THEN 1
            ELSE 0
        END AS pedestrian_sus_serious_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 4
                AND people_with_ems_overrides.vz_mode_category_id = 11
                THEN 1
            ELSE 0
        END AS micromobility_fatal_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 1
                AND people_with_ems_overrides.vz_mode_category_id = 11
                THEN 1
            ELSE 0
        END AS micromobility_sus_serious_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 4
                AND (people_with_ems_overrides.vz_mode_category_id = ANY(ARRAY[6, 8, 9]))
                THEN 1
            ELSE 0
        END AS other_fatal_injry,
        CASE
            WHEN
                people_with_ems_overrides.combined_inj_sev_id = 1
                AND (people_with_ems_overrides.vz_mode_category_id = ANY(ARRAY[6, 8, 9]))
                THEN 1
            ELSE 0
        END AS other_sus_serious_injry
    FROM people_with_ems_overrides
),

ems_unmatched_patients AS (
    SELECT
        e.id::bigint AS id,
        NULL::bigint AS unit_id,
        e.crash_pk,
        NULL::bigint AS cris_crash_id,
        'ems'::text  AS record_source,
        e.years_of_life_lost,
        e.est_comp_cost_crash_based,
        CASE
            WHEN e.patient_injry_sev_id = 0 THEN 1
            ELSE 0
        END          AS unkn_injry,
        CASE
            WHEN e.patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END          AS sus_serious_injry,
        CASE
            WHEN e.patient_injry_sev_id = 2 THEN 1
            ELSE 0
        END          AS nonincap_injry,
        CASE
            WHEN e.patient_injry_sev_id = 3 THEN 1
            ELSE 0
        END          AS poss_injry,
        CASE
            WHEN e.patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END          AS fatal_injury,
        CASE
            WHEN e.patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END          AS vz_fatal_injury,
        0            AS law_enf_fatal_injury,
        0            AS cris_fatal_injury,
        CASE
            WHEN e.patient_injry_sev_id = 5 THEN 1
            ELSE 0
        END          AS non_injry,
        CASE
            WHEN e.travel_mode = 'Motor Vehicle'::text AND e.patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END          AS motor_vehicle_fatal_injry,
        CASE
            WHEN e.travel_mode = 'Motor Vehicle'::text AND e.patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END          AS motor_vehicle_sus_serious_injry,
        CASE
            WHEN e.travel_mode = 'Motorcycle'::text AND e.patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END          AS motorcycle_fatal_injry,
        CASE
            WHEN e.travel_mode = 'Motorcycle'::text AND e.patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END          AS motorycle_sus_serious_injry,
        CASE
            WHEN e.travel_mode = 'Bicycle'::text AND e.patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END          AS bicycle_fatal_injry,
        CASE
            WHEN e.travel_mode = 'Bicycle'::text AND e.patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END          AS bicycle_sus_serious_injry,
        CASE
            WHEN e.travel_mode = 'Pedestrian'::text AND e.patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END          AS pedestrian_fatal_injry,
        CASE
            WHEN e.travel_mode = 'Pedestrian'::text AND e.patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END          AS pedestrian_sus_serious_injry,
        CASE
            WHEN e.travel_mode = 'E-Scooter'::text AND e.patient_injry_sev_id = 4 THEN 1
            ELSE 0
        END          AS micromobility_fatal_injry,
        CASE
            WHEN e.travel_mode = 'E-Scooter'::text AND e.patient_injry_sev_id = 1 THEN 1
            ELSE 0
        END          AS micromobility_sus_serious_injry,
        CASE
            WHEN
                (
                    e.travel_mode
                    <> ALL(
                        ARRAY[
                            'Motor Vehicle'::text,
                            'Motorcycle'::text,
                            'Bicycle'::text,
                            'Pedestrian'::text,
                            'E-Scooter'::text
                        ]
                    )
                )
                AND e.patient_injry_sev_id = 4
                THEN 1
            ELSE 0
        END          AS other_fatal_injry,
        CASE
            WHEN
                (
                    e.travel_mode
                    <> ALL(
                        ARRAY[
                            'Motor Vehicle'::text,
                            'Motorcycle'::text,
                            'Bicycle'::text,
                            'Pedestrian'::text,
                            'E-Scooter'::text
                        ]
                    )
                )
                AND e.patient_injry_sev_id = 1
                THEN 1
            ELSE 0
        END          AS other_sus_serious_injry
    FROM ems__incidents e
    WHERE e.is_deleted = FALSE AND e.person_id IS NULL
)

SELECT
    people_injury_metrics_with_overrides.id,
    people_injury_metrics_with_overrides.unit_id,
    people_injury_metrics_with_overrides.crash_pk,
    people_injury_metrics_with_overrides.cris_crash_id,
    people_injury_metrics_with_overrides.record_source,
    people_injury_metrics_with_overrides.years_of_life_lost,
    people_injury_metrics_with_overrides.est_comp_cost_crash_based,
    people_injury_metrics_with_overrides.upgrade_to_sus_serious_injry,
    people_injury_metrics_with_overrides.downgrade_from_sus_serious_injry,
    people_injury_metrics_with_overrides.unkn_injry,
    people_injury_metrics_with_overrides.sus_serious_injry,
    people_injury_metrics_with_overrides.nonincap_injry,
    people_injury_metrics_with_overrides.poss_injry,
    people_injury_metrics_with_overrides.fatal_injury,
    people_injury_metrics_with_overrides.vz_fatal_injury,
    people_injury_metrics_with_overrides.law_enf_fatal_injury,
    people_injury_metrics_with_overrides.cris_fatal_injury,
    people_injury_metrics_with_overrides.non_injry,
    people_injury_metrics_with_overrides.motor_vehicle_fatal_injry,
    people_injury_metrics_with_overrides.motor_vehicle_sus_serious_injry,
    people_injury_metrics_with_overrides.motorcycle_fatal_injry,
    people_injury_metrics_with_overrides.motorycle_sus_serious_injry,
    people_injury_metrics_with_overrides.bicycle_fatal_injry,
    people_injury_metrics_with_overrides.bicycle_sus_serious_injry,
    people_injury_metrics_with_overrides.pedestrian_fatal_injry,
    people_injury_metrics_with_overrides.pedestrian_sus_serious_injry,
    people_injury_metrics_with_overrides.micromobility_fatal_injry,
    people_injury_metrics_with_overrides.micromobility_sus_serious_injry,
    people_injury_metrics_with_overrides.other_fatal_injry,
    people_injury_metrics_with_overrides.other_sus_serious_injry
FROM people_injury_metrics_with_overrides
UNION ALL
SELECT
    ems_unmatched_patients.id,
    ems_unmatched_patients.unit_id,
    ems_unmatched_patients.crash_pk,
    ems_unmatched_patients.cris_crash_id,
    ems_unmatched_patients.record_source,
    ems_unmatched_patients.years_of_life_lost,
    ems_unmatched_patients.est_comp_cost_crash_based,
    0 AS upgrade_to_sus_serious_injry,
    0 AS downgrade_from_sus_serious_injry,
    ems_unmatched_patients.unkn_injry,
    ems_unmatched_patients.sus_serious_injry,
    ems_unmatched_patients.nonincap_injry,
    ems_unmatched_patients.poss_injry,
    ems_unmatched_patients.fatal_injury,
    ems_unmatched_patients.vz_fatal_injury,
    ems_unmatched_patients.law_enf_fatal_injury,
    ems_unmatched_patients.cris_fatal_injury,
    ems_unmatched_patients.non_injry,
    ems_unmatched_patients.motor_vehicle_fatal_injry,
    ems_unmatched_patients.motor_vehicle_sus_serious_injry,
    ems_unmatched_patients.motorcycle_fatal_injry,
    ems_unmatched_patients.motorycle_sus_serious_injry,
    ems_unmatched_patients.bicycle_fatal_injry,
    ems_unmatched_patients.bicycle_sus_serious_injry,
    ems_unmatched_patients.pedestrian_fatal_injry,
    ems_unmatched_patients.pedestrian_sus_serious_injry,
    ems_unmatched_patients.micromobility_fatal_injry,
    ems_unmatched_patients.micromobility_sus_serious_injry,
    ems_unmatched_patients.other_fatal_injry,
    ems_unmatched_patients.other_sus_serious_injry
FROM ems_unmatched_patients;
