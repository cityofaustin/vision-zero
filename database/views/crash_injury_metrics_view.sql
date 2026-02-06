-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW crash_injury_metrics_view AS SELECT
    crashes.id,
    crashes.cris_crash_id,
    COALESCE(
        SUM(person_injury_metrics_view.unkn_injry), 0::bigint
    ) AS unkn_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.nonincap_injry), 0::bigint
    ) AS nonincap_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.poss_injry), 0::bigint
    ) AS poss_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.non_injry), 0::bigint
    ) AS non_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.sus_serious_injry), 0::bigint
    ) AS sus_serious_injry_count,
    COALESCE(SUM(person_injury_metrics_view.nonincap_injry), 0::bigint)
    + COALESCE(SUM(person_injury_metrics_view.poss_injry), 0::bigint)
    + COALESCE(
        SUM(person_injury_metrics_view.sus_serious_injry), 0::bigint
    ) AS tot_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.fatal_injury), 0::bigint
    ) AS fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.vz_fatal_injury), 0::bigint
    ) AS vz_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.law_enf_fatal_injury), 0::bigint
    ) AS law_enf_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.cris_fatal_injury), 0::bigint
    ) AS cris_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.motor_vehicle_fatal_injry), 0::bigint
    ) AS motor_vehicle_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.motor_vehicle_sus_serious_injry),
        0::bigint
    ) AS motor_vehicle_sus_serious_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.motorcycle_fatal_injry), 0::bigint
    ) AS motorcycle_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.motorycle_sus_serious_injry), 0::bigint
    ) AS motorcycle_sus_serious_count,
    COALESCE(
        SUM(person_injury_metrics_view.bicycle_fatal_injry), 0::bigint
    ) AS bicycle_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.bicycle_sus_serious_injry), 0::bigint
    ) AS bicycle_sus_serious_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.pedestrian_fatal_injry), 0::bigint
    ) AS pedestrian_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.pedestrian_sus_serious_injry), 0::bigint
    ) AS pedestrian_sus_serious_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.micromobility_fatal_injry), 0::bigint
    ) AS micromobility_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.micromobility_sus_serious_injry),
        0::bigint
    ) AS micromobility_sus_serious_injry_count,
    COALESCE(
        SUM(person_injury_metrics_view.other_fatal_injry), 0::bigint
    ) AS other_fatality_count,
    COALESCE(
        SUM(person_injury_metrics_view.other_sus_serious_injry), 0::bigint
    ) AS other_sus_serious_injry_count,
    CASE
        WHEN SUM(person_injury_metrics_view.fatal_injury) > 0 THEN 4
        WHEN SUM(person_injury_metrics_view.sus_serious_injry) > 0 THEN 1
        WHEN SUM(person_injury_metrics_view.nonincap_injry) > 0 THEN 2
        WHEN SUM(person_injury_metrics_view.poss_injry) > 0 THEN 3
        WHEN SUM(person_injury_metrics_view.unkn_injry) > 0 THEN 0
        WHEN SUM(person_injury_metrics_view.non_injry) > 0 THEN 5
        ELSE 0
    END AS crash_injry_sev_id,
    COALESCE(
        SUM(person_injury_metrics_view.years_of_life_lost), 0::bigint
    ) AS years_of_life_lost,
    COALESCE(
        MAX(person_injury_metrics_view.est_comp_cost_crash_based), 20000
    ) AS est_comp_cost_crash_based,
    COALESCE(
        SUM(person_injury_metrics_view.est_comp_cost_crash_based), 20000::bigint
    ) AS est_total_person_comp_cost
FROM crashes crashes
LEFT JOIN
    person_injury_metrics_view
    ON crashes.id = person_injury_metrics_view.crash_pk
WHERE crashes.is_deleted = false
GROUP BY crashes.id, crashes.cris_crash_id;
