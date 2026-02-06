-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW socrata_export_crashes_view AS WITH unit_aggregates AS (
    SELECT
        crashes_1.id,
        string_agg(DISTINCT mode_categories.label, ' & '::text) AS units_involved
    FROM crashes crashes_1
    LEFT JOIN units ON crashes_1.id = units.crash_pk
    LEFT JOIN lookups.mode_category mode_categories ON units.vz_mode_category_id = mode_categories.id
    GROUP BY crashes_1.id
)

SELECT
    crashes.id,
    crashes.cris_crash_id,
    crashes.case_id,
    crashes.is_deleted,
    crashes.latitude,
    crashes.longitude,
    crashes.address_display,
    crashes.rpt_block_num,
    crashes.rpt_street_name,
    crashes.rpt_street_pfx,
    crashes.rpt_street_sfx,
    location.location_id,
    location.location_group,
    crashes.crash_speed_limit,
    crashes.road_constr_zone_fl,
    crashes.is_temp_record,
    cimv.crash_injry_sev_id                                           AS crash_sev_id,
    cimv.sus_serious_injry_count                                      AS sus_serious_injry_cnt,
    cimv.nonincap_injry_count                                         AS nonincap_injry_cnt,
    cimv.poss_injry_count                                             AS poss_injry_cnt,
    cimv.non_injry_count                                              AS non_injry_cnt,
    cimv.unkn_injry_count                                             AS unkn_injry_cnt,
    cimv.tot_injry_count                                              AS tot_injry_cnt,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost,
    cimv.law_enf_fatality_count,
    cimv.vz_fatality_count                                            AS death_cnt,
    crashes.onsys_fl,
    crashes.private_dr_fl,
    unit_aggregates.units_involved,
    cimv.motor_vehicle_fatality_count                                 AS motor_vehicle_death_count,
    cimv.motor_vehicle_sus_serious_injry_count                        AS motor_vehicle_serious_injury_count,
    cimv.bicycle_fatality_count                                       AS bicycle_death_count,
    cimv.bicycle_sus_serious_injry_count                              AS bicycle_serious_injury_count,
    cimv.pedestrian_fatality_count                                    AS pedestrian_death_count,
    cimv.pedestrian_sus_serious_injry_count                           AS pedestrian_serious_injury_count,
    cimv.motorcycle_fatality_count                                    AS motorcycle_death_count,
    cimv.motorcycle_sus_serious_count                                 AS motorcycle_serious_injury_count,
    cimv.micromobility_fatality_count                                 AS micromobility_death_count,
    cimv.micromobility_sus_serious_injry_count                        AS micromobility_serious_injury_count,
    cimv.other_fatality_count                                         AS other_death_count,
    cimv.other_sus_serious_injry_count                                AS other_serious_injury_count,
    cimv.years_of_life_lost,
    to_char(crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                                                                 AS crash_timestamp_ct,
    CASE
        WHEN
            crashes.latitude IS NOT NULL AND crashes.longitude IS NOT NULL
            THEN ((('POINT ('::text || crashes.longitude::text) || ' '::text) || crashes.latitude::text) || ')'::text
        ELSE NULL::text
    END                                                               AS point,
    coalesce(cimv.crash_injry_sev_id = 4, FALSE)                      AS crash_fatal_fl
FROM crashes
LEFT JOIN LATERAL (SELECT
    crash_injury_metrics_view.id,
    crash_injury_metrics_view.cris_crash_id,
    crash_injury_metrics_view.unkn_injry_count,
    crash_injury_metrics_view.nonincap_injry_count,
    crash_injury_metrics_view.poss_injry_count,
    crash_injury_metrics_view.non_injry_count,
    crash_injury_metrics_view.sus_serious_injry_count,
    crash_injury_metrics_view.tot_injry_count,
    crash_injury_metrics_view.fatality_count,
    crash_injury_metrics_view.vz_fatality_count,
    crash_injury_metrics_view.law_enf_fatality_count,
    crash_injury_metrics_view.cris_fatality_count,
    crash_injury_metrics_view.motor_vehicle_fatality_count,
    crash_injury_metrics_view.motor_vehicle_sus_serious_injry_count,
    crash_injury_metrics_view.motorcycle_fatality_count,
    crash_injury_metrics_view.motorcycle_sus_serious_count,
    crash_injury_metrics_view.bicycle_fatality_count,
    crash_injury_metrics_view.bicycle_sus_serious_injry_count,
    crash_injury_metrics_view.pedestrian_fatality_count,
    crash_injury_metrics_view.pedestrian_sus_serious_injry_count,
    crash_injury_metrics_view.micromobility_fatality_count,
    crash_injury_metrics_view.micromobility_sus_serious_injry_count,
    crash_injury_metrics_view.other_fatality_count,
    crash_injury_metrics_view.other_sus_serious_injry_count,
    crash_injury_metrics_view.crash_injry_sev_id,
    crash_injury_metrics_view.years_of_life_lost,
    crash_injury_metrics_view.est_comp_cost_crash_based,
    crash_injury_metrics_view.est_total_person_comp_cost
FROM crash_injury_metrics_view
WHERE crashes.id = crash_injury_metrics_view.id
LIMIT 1) cimv ON TRUE
LEFT JOIN LATERAL (SELECT
    unit_aggregates_1.id,
    unit_aggregates_1.units_involved
FROM unit_aggregates unit_aggregates_1
WHERE crashes.id = unit_aggregates_1.id
LIMIT 1) unit_aggregates ON TRUE
LEFT JOIN locations location ON crashes.location_id = location.location_id::text
WHERE
    crashes.is_deleted = FALSE
    AND crashes.in_austin_full_purpose = TRUE
    AND crashes.private_dr_fl = FALSE
    AND crashes.crash_timestamp < (now() - '14 days'::interval)
ORDER BY crashes.id;
