-- Most recent migration: 

CREATE OR REPLACE VIEW combined_person_injury_metrics_view AS
WITH person_severity_resolved AS (
    SELECT
        people.id,
        units.id                      AS unit_id,
        crashes.id                    AS crash_pk,
        crashes.cris_crash_id,
        units.vz_mode_category_id,
        people.years_of_life_lost,
        people.est_comp_cost_crash_based,
        CASE
            WHEN people.prsn_injry_sev_id = 4 THEN 4
            WHEN people.prsn_injry_sev_id = 99 THEN 99
            WHEN ems.patient_injry_sev_id IS NOT NULL THEN ems.patient_injry_sev_id
            ELSE people.prsn_injry_sev_id
        END                           AS inj_sev_id,
        crashes.law_enforcement_ytd_fatality_num,
        people_cris.prsn_injry_sev_id AS cris_prsn_injry_sev_id,
        CASE
            WHEN ems.id IS NOT NULL THEN 'crash_report_plus_ems'::text
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

person_injury_metrics_resolved AS (
    SELECT
        person_severity_resolved.id,
        person_severity_resolved.unit_id,
        person_severity_resolved.crash_pk,
        person_severity_resolved.cris_crash_id,
        person_severity_resolved.record_source,
        person_severity_resolved.years_of_life_lost,
        person_severity_resolved.est_comp_cost_crash_based,
        CASE
            WHEN person_severity_resolved.inj_sev_id = 0 THEN 1
            ELSE 0
        END AS unkn_injry,
        CASE
            WHEN person_severity_resolved.inj_sev_id = 1 THEN 1
            ELSE 0
        END AS sus_serious_injry,
        CASE
            WHEN person_severity_resolved.inj_sev_id = 2 THEN 1
            ELSE 0
        END AS nonincap_injry,
        CASE
            WHEN person_severity_resolved.inj_sev_id = 3 THEN 1
            ELSE 0
        END AS poss_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 4 OR person_severity_resolved.inj_sev_id = 99
                THEN 1
            ELSE 0
        END AS fatal_injury,
        CASE
            WHEN person_severity_resolved.inj_sev_id = 4 THEN 1
            ELSE 0
        END AS vz_fatal_injury,
        CASE
            WHEN
                (
                    person_severity_resolved.inj_sev_id = 4
                    OR person_severity_resolved.inj_sev_id = 99
                )
                AND person_severity_resolved.law_enforcement_ytd_fatality_num IS NOT NULL
                THEN 1
            ELSE 0
        END AS law_enf_fatal_injury,
        CASE
            WHEN person_severity_resolved.cris_prsn_injry_sev_id = 4 THEN 1
            ELSE 0
        END AS cris_fatal_injury,
        CASE
            WHEN person_severity_resolved.inj_sev_id = 5 THEN 1
            ELSE 0
        END AS non_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 4
                AND (person_severity_resolved.vz_mode_category_id = ANY(ARRAY[1, 2, 4]))
                THEN 1
            ELSE 0
        END AS motor_vehicle_fatal_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 1
                AND (person_severity_resolved.vz_mode_category_id = ANY(ARRAY[1, 2, 4]))
                THEN 1
            ELSE 0
        END AS motor_vehicle_sus_serious_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 4
                AND person_severity_resolved.vz_mode_category_id = 3
                THEN 1
            ELSE 0
        END AS motorcycle_fatal_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 1
                AND person_severity_resolved.vz_mode_category_id = 3
                THEN 1
            ELSE 0
        END AS motorycle_sus_serious_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 4
                AND person_severity_resolved.vz_mode_category_id = 5
                THEN 1
            ELSE 0
        END AS bicycle_fatal_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 1
                AND person_severity_resolved.vz_mode_category_id = 5
                THEN 1
            ELSE 0
        END AS bicycle_sus_serious_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 4
                AND person_severity_resolved.vz_mode_category_id = 7
                THEN 1
            ELSE 0
        END AS pedestrian_fatal_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 1
                AND person_severity_resolved.vz_mode_category_id = 7
                THEN 1
            ELSE 0
        END AS pedestrian_sus_serious_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 4
                AND person_severity_resolved.vz_mode_category_id = 11
                THEN 1
            ELSE 0
        END AS micromobility_fatal_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 1
                AND person_severity_resolved.vz_mode_category_id = 11
                THEN 1
            ELSE 0
        END AS micromobility_sus_serious_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 4
                AND (person_severity_resolved.vz_mode_category_id = ANY(ARRAY[6, 8, 9]))
                THEN 1
            ELSE 0
        END AS other_fatal_injry,
        CASE
            WHEN
                person_severity_resolved.inj_sev_id = 1
                AND (person_severity_resolved.vz_mode_category_id = ANY(ARRAY[6, 8, 9]))
                THEN 1
            ELSE 0
        END AS other_sus_serious_injry
    FROM person_severity_resolved
),

ems_unmatched_persons AS (
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
    person_injury_metrics_resolved.id,
    person_injury_metrics_resolved.unit_id,
    person_injury_metrics_resolved.crash_pk,
    person_injury_metrics_resolved.cris_crash_id,
    person_injury_metrics_resolved.record_source,
    person_injury_metrics_resolved.years_of_life_lost,
    person_injury_metrics_resolved.est_comp_cost_crash_based,
    person_injury_metrics_resolved.unkn_injry,
    person_injury_metrics_resolved.sus_serious_injry,
    person_injury_metrics_resolved.nonincap_injry,
    person_injury_metrics_resolved.poss_injry,
    person_injury_metrics_resolved.fatal_injury,
    person_injury_metrics_resolved.vz_fatal_injury,
    person_injury_metrics_resolved.law_enf_fatal_injury,
    person_injury_metrics_resolved.cris_fatal_injury,
    person_injury_metrics_resolved.non_injry,
    person_injury_metrics_resolved.motor_vehicle_fatal_injry,
    person_injury_metrics_resolved.motor_vehicle_sus_serious_injry,
    person_injury_metrics_resolved.motorcycle_fatal_injry,
    person_injury_metrics_resolved.motorycle_sus_serious_injry,
    person_injury_metrics_resolved.bicycle_fatal_injry,
    person_injury_metrics_resolved.bicycle_sus_serious_injry,
    person_injury_metrics_resolved.pedestrian_fatal_injry,
    person_injury_metrics_resolved.pedestrian_sus_serious_injry,
    person_injury_metrics_resolved.micromobility_fatal_injry,
    person_injury_metrics_resolved.micromobility_sus_serious_injry,
    person_injury_metrics_resolved.other_fatal_injry,
    person_injury_metrics_resolved.other_sus_serious_injry
FROM person_injury_metrics_resolved
UNION ALL
SELECT
    ems_unmatched_persons.id,
    ems_unmatched_persons.unit_id,
    ems_unmatched_persons.crash_pk,
    ems_unmatched_persons.cris_crash_id,
    ems_unmatched_persons.record_source,
    ems_unmatched_persons.years_of_life_lost,
    ems_unmatched_persons.est_comp_cost_crash_based,
    ems_unmatched_persons.unkn_injry,
    ems_unmatched_persons.sus_serious_injry,
    ems_unmatched_persons.nonincap_injry,
    ems_unmatched_persons.poss_injry,
    ems_unmatched_persons.fatal_injury,
    ems_unmatched_persons.vz_fatal_injury,
    ems_unmatched_persons.law_enf_fatal_injury,
    ems_unmatched_persons.cris_fatal_injury,
    ems_unmatched_persons.non_injry,
    ems_unmatched_persons.motor_vehicle_fatal_injry,
    ems_unmatched_persons.motor_vehicle_sus_serious_injry,
    ems_unmatched_persons.motorcycle_fatal_injry,
    ems_unmatched_persons.motorycle_sus_serious_injry,
    ems_unmatched_persons.bicycle_fatal_injry,
    ems_unmatched_persons.bicycle_sus_serious_injry,
    ems_unmatched_persons.pedestrian_fatal_injry,
    ems_unmatched_persons.pedestrian_sus_serious_injry,
    ems_unmatched_persons.micromobility_fatal_injry,
    ems_unmatched_persons.micromobility_sus_serious_injry,
    ems_unmatched_persons.other_fatal_injry,
    ems_unmatched_persons.other_sus_serious_injry
FROM ems_unmatched_persons;
