-- Most recent migration: database/migrations/default/1787848628285_ems_crash_list_view/up.sql

DROP MATERIALIZED VIEW IF EXISTS combined_crash_injury_metrics_view;

CREATE MATERIALIZED VIEW combined_crash_injury_metrics_view AS
SELECT
    crashes.id,
    crashes.cris_crash_id,
    CASE
        WHEN
            count(*) FILTER (WHERE cpimv.record_source = 'crash_report_and_ems'::text) > 0
            THEN 'crash_report_and_ems'::text
        WHEN
            count(*) FILTER (WHERE cpimv.record_source = 'ems'::text) > 0
            THEN 'crash_report_and_ems'::text
        ELSE 'crash_report'::text
    END                                                 AS record_source,
    coalesce(
        sum(cpimv.upgrade_to_sus_serious_injry), 0::bigint
    )                                                   AS upgrade_to_sus_serious_injry_count,
    coalesce(
        sum(cpimv.downgrade_from_sus_serious_injry), 0::bigint
    )                                                   AS downgrade_from_sus_serious_injry,
    coalesce(
        sum(cpimv.unkn_injry), 0::bigint
    )                                                   AS unkn_injry_count,
    coalesce(
        sum(cpimv.nonincap_injry), 0::bigint
    )                                                   AS nonincap_injry_count,
    coalesce(
        sum(cpimv.poss_injry), 0::bigint
    )                                                   AS poss_injry_count,
    coalesce(
        sum(cpimv.non_injry), 0::bigint
    )                                                   AS non_injry_count,
    coalesce(
        sum(cpimv.sus_serious_injry), 0::bigint
    )                                                   AS sus_serious_injry_count,
    coalesce(sum(cpimv.nonincap_injry), 0::bigint)
    + coalesce(sum(cpimv.poss_injry), 0::bigint)
    + coalesce(sum(cpimv.sus_serious_injry), 0::bigint) AS tot_injry_count,
    coalesce(
        sum(cpimv.fatal_injury), 0::bigint
    )                                                   AS fatality_count,
    coalesce(
        sum(cpimv.vz_fatal_injury), 0::bigint
    )                                                   AS vz_fatality_count,
    coalesce(
        sum(cpimv.law_enf_fatal_injury), 0::bigint
    )                                                   AS law_enf_fatality_count,
    coalesce(
        sum(cpimv.cris_fatal_injury), 0::bigint
    )                                                   AS cris_fatality_count,
    coalesce(
        sum(cpimv.motor_vehicle_fatal_injry), 0::bigint
    )                                                   AS motor_vehicle_fatality_count,
    coalesce(
        sum(cpimv.motor_vehicle_sus_serious_injry), 0::bigint
    )                                                   AS motor_vehicle_sus_serious_injry_count,
    coalesce(
        sum(cpimv.motorcycle_fatal_injry), 0::bigint
    )                                                   AS motorcycle_fatality_count,
    coalesce(
        sum(cpimv.motorycle_sus_serious_injry), 0::bigint
    )                                                   AS motorcycle_sus_serious_count,
    coalesce(
        sum(cpimv.bicycle_fatal_injry), 0::bigint
    )                                                   AS bicycle_fatality_count,
    coalesce(
        sum(cpimv.bicycle_sus_serious_injry), 0::bigint
    )                                                   AS bicycle_sus_serious_injry_count,
    coalesce(
        sum(cpimv.pedestrian_fatal_injry), 0::bigint
    )                                                   AS pedestrian_fatality_count,
    coalesce(
        sum(cpimv.pedestrian_sus_serious_injry), 0::bigint
    )                                                   AS pedestrian_sus_serious_injry_count,
    coalesce(
        sum(cpimv.micromobility_fatal_injry), 0::bigint
    )                                                   AS micromobility_fatality_count,
    coalesce(
        sum(cpimv.micromobility_sus_serious_injry), 0::bigint
    )                                                   AS micromobility_sus_serious_injry_count,
    coalesce(
        sum(cpimv.other_fatal_injry), 0::bigint
    )                                                   AS other_fatality_count,
    coalesce(
        sum(cpimv.other_sus_serious_injry), 0::bigint
    )                                                   AS other_sus_serious_injry_count,
    CASE
        WHEN sum(cpimv.fatal_injury) > 0 THEN 4
        WHEN sum(cpimv.sus_serious_injry) > 0 THEN 1
        WHEN sum(cpimv.nonincap_injry) > 0 THEN 2
        WHEN sum(cpimv.poss_injry) > 0 THEN 3
        WHEN sum(cpimv.unkn_injry) > 0 THEN 0
        WHEN sum(cpimv.non_injry) > 0 THEN 5
        ELSE 0
    END                                                 AS crash_injry_sev_id,
    coalesce(
        sum(cpimv.years_of_life_lost), 0::bigint::numeric
    )                                                   AS years_of_life_lost,
    coalesce(
        max(cpimv.est_comp_cost_crash_based), 20000::bigint
    )                                                   AS est_comp_cost_crash_based,
    coalesce(
        sum(cpimv.est_comp_cost_crash_based), 20000::bigint::numeric
    )                                                   AS est_total_person_comp_cost,
    count(*) FILTER (
        WHERE cpimv.record_source = 'crash_report_and_ems'::text
    )                                                   AS matched_person_count,
    count(*) FILTER (
        WHERE cpimv.record_source = 'crash_report'::text
    )                                                   AS unmatched_person_count,
    count(*) FILTER (
        WHERE cpimv.record_source = 'ems'::text
    )                                                   AS unmatched_ems_count,
    count(*) FILTER (
        WHERE (cpimv.record_source = any(ARRAY['crash_report'::text, 'ems'::text]))
        AND (cpimv.sus_serious_injry = 1 OR cpimv.fatal_injury = 1)
    )                                                   AS unmatched_serious_or_fatal_count
FROM crashes crashes
LEFT JOIN combined_person_injury_metrics_view cpimv ON crashes.id = cpimv.crash_pk
WHERE crashes.is_deleted = false
GROUP BY crashes.id, crashes.cris_crash_id;
