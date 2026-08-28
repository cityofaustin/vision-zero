-- Most recent migration: database/migrations/default/1787848860828_combined_ems_crash_socrata_exports/up.sql

CREATE OR REPLACE VIEW socrata_export_crashes_combined_view AS
SELECT
    'crashes_'::text
    || crashes.id::text                        AS record_id,
    'crashes'::text                            AS record_table_name,
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
    cimv.record_source,
    cimv.crash_injry_sev_id                    AS crash_sev_id,
    cimv.sus_serious_injry_count               AS sus_serious_injry_cnt,
    cimv.nonincap_injry_count                  AS nonincap_injry_cnt,
    cimv.poss_injry_count                      AS poss_injry_cnt,
    cimv.non_injry_count                       AS non_injry_cnt,
    cimv.unkn_injry_count                      AS unkn_injry_cnt,
    cimv.tot_injry_count                       AS tot_injry_cnt,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost,
    cimv.law_enf_fatality_count,
    cimv.vz_fatality_count                     AS death_cnt,
    crashes.onsys_fl,
    crashes.private_dr_fl,
    unit_aggregates.units_involved,
    cimv.motor_vehicle_fatality_count          AS motor_vehicle_death_count,
    cimv.motor_vehicle_sus_serious_injry_count AS motor_vehicle_serious_injury_count,
    cimv.bicycle_fatality_count                AS bicycle_death_count,
    cimv.bicycle_sus_serious_injry_count       AS bicycle_serious_injury_count,
    cimv.pedestrian_fatality_count             AS pedestrian_death_count,
    cimv.pedestrian_sus_serious_injry_count    AS pedestrian_serious_injury_count,
    cimv.motorcycle_fatality_count             AS motorcycle_death_count,
    cimv.motorcycle_sus_serious_count          AS motorcycle_serious_injury_count,
    cimv.micromobility_fatality_count          AS micromobility_death_count,
    cimv.micromobility_sus_serious_injry_count AS micromobility_serious_injury_count,
    cimv.other_fatality_count                  AS other_death_count,
    cimv.other_sus_serious_injry_count         AS other_serious_injury_count,
    cimv.years_of_life_lost,
    to_char(
        crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                                          AS crash_timestamp,
    to_char(
        (crashes.crash_timestamp AT TIME ZONE 'America/Chicago'::text),
        'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                                          AS crash_timestamp_ct,
    CASE
        WHEN
            crashes.latitude IS NOT NULL AND crashes.longitude IS NOT NULL
            THEN
                (
                    (('POINT ('::text || crashes.longitude::text) || ' '::text)
                    || crashes.latitude::text
                )
                || ')'::text
        ELSE NULL::text
    END                                        AS point,
    coalesce(
        cimv.crash_injry_sev_id = 4, FALSE
    )                                          AS crash_fatal_fl,
    collsn.label                               AS collsn_desc
FROM crashes crashes
LEFT JOIN LATERAL (SELECT
    combined_crash_injury_metrics_view.id,
    combined_crash_injury_metrics_view.cris_crash_id,
    combined_crash_injury_metrics_view.record_source,
    combined_crash_injury_metrics_view.upgrade_to_sus_serious_injry_count,
    combined_crash_injury_metrics_view.downgrade_from_sus_serious_injry,
    combined_crash_injury_metrics_view.unkn_injry_count,
    combined_crash_injury_metrics_view.nonincap_injry_count,
    combined_crash_injury_metrics_view.poss_injry_count,
    combined_crash_injury_metrics_view.non_injry_count,
    combined_crash_injury_metrics_view.sus_serious_injry_count,
    combined_crash_injury_metrics_view.tot_injry_count,
    combined_crash_injury_metrics_view.fatality_count,
    combined_crash_injury_metrics_view.vz_fatality_count,
    combined_crash_injury_metrics_view.law_enf_fatality_count,
    combined_crash_injury_metrics_view.cris_fatality_count,
    combined_crash_injury_metrics_view.motor_vehicle_fatality_count,
    combined_crash_injury_metrics_view.motor_vehicle_sus_serious_injry_count,
    combined_crash_injury_metrics_view.motorcycle_fatality_count,
    combined_crash_injury_metrics_view.motorcycle_sus_serious_count,
    combined_crash_injury_metrics_view.bicycle_fatality_count,
    combined_crash_injury_metrics_view.bicycle_sus_serious_injry_count,
    combined_crash_injury_metrics_view.pedestrian_fatality_count,
    combined_crash_injury_metrics_view.pedestrian_sus_serious_injry_count,
    combined_crash_injury_metrics_view.micromobility_fatality_count,
    combined_crash_injury_metrics_view.micromobility_sus_serious_injry_count,
    combined_crash_injury_metrics_view.other_fatality_count,
    combined_crash_injury_metrics_view.other_sus_serious_injry_count,
    combined_crash_injury_metrics_view.crash_injry_sev_id,
    combined_crash_injury_metrics_view.years_of_life_lost,
    combined_crash_injury_metrics_view.est_comp_cost_crash_based,
    combined_crash_injury_metrics_view.est_total_person_comp_cost,
    combined_crash_injury_metrics_view.matched_person_count,
    combined_crash_injury_metrics_view.unmatched_person_count,
    combined_crash_injury_metrics_view.unmatched_ems_count,
    combined_crash_injury_metrics_view.unmatched_serious_or_fatal_count
FROM combined_crash_injury_metrics_view
WHERE crashes.id = combined_crash_injury_metrics_view.id
LIMIT 1) cimv ON TRUE
LEFT JOIN lookups.collsn ON crashes.fhe_collsn_id = collsn.id
LEFT JOIN locations location ON crashes.location_id = location.location_id::text
LEFT JOIN crash_unit_aggregates_view unit_aggregates ON crashes.id = unit_aggregates.id
WHERE
    crashes.is_deleted = FALSE
    AND crashes.in_austin_full_purpose = TRUE
    AND crashes.private_dr_fl = FALSE
    AND crashes.crash_timestamp < (now() - '14 days'::interval)
UNION ALL
SELECT
    'ems_incident_'::text
    || ei.incident_number                    AS record_id,
    'ems__incidents'::text                   AS record_table_name,
    NULL::integer                            AS cris_crash_id,
    ei.incident_number                       AS case_id,
    FALSE                                    AS is_deleted,
    ei.latitude,
    ei.longitude,
    ei.incident_location_address             AS address_display,
    NULL::text                               AS rpt_block_num,
    NULL::text                               AS rpt_street_name,
    NULL::text                               AS rpt_street_pfx,
    NULL::text                               AS rpt_street_sfx,
    location.location_id,
    location.location_group,
    NULL::integer                            AS crash_speed_limit,
    NULL::boolean                            AS road_constr_zone_fl,
    FALSE                                    AS is_temp_record,
    'ems'::text                              AS record_source,
    ei.crash_injry_sev_id                    AS crash_sev_id,
    ei.sus_serious_injry_count               AS sus_serious_injry_cnt,
    ei.nonincap_injry_count                  AS nonincap_injry_cnt,
    ei.poss_injry_count                      AS poss_injry_cnt,
    ei.non_injry_count                       AS non_injry_cnt,
    ei.unkn_injry_count                      AS unkn_injry_cnt,
    ei.tot_injry_count                       AS tot_injry_cnt,
    ei.est_comp_cost_crash_based,
    ei.est_total_person_comp_cost,
    NULL::bigint                             AS law_enf_fatality_count,
    ei.vz_fatality_count                     AS death_cnt,
    NULL::boolean                            AS onsys_fl,
    NULL::boolean                            AS private_dr_fl,
    ei.units_involved,
    ei.motor_vehicle_fatality_count          AS motor_vehicle_death_count,
    ei.motor_vehicle_sus_serious_injry_count AS motor_vehicle_serious_injury_count,
    ei.bicycle_fatality_count                AS bicycle_death_count,
    ei.bicycle_sus_serious_injry_count       AS bicycle_serious_injury_count,
    ei.pedestrian_fatality_count             AS pedestrian_death_count,
    ei.pedestrian_sus_serious_injry_count    AS pedestrian_serious_injury_count,
    ei.motorcycle_fatality_count             AS motorcycle_death_count,
    ei.motorcycle_sus_serious_count          AS motorcycle_serious_injury_count,
    ei.micromobility_fatality_count          AS micromobility_death_count,
    ei.micromobility_sus_serious_injry_count AS micromobility_serious_injury_count,
    ei.other_fatality_count                  AS other_death_count,
    ei.other_sus_serious_injry_count         AS other_serious_injury_count,
    ei.years_of_life_lost,
    to_char(
        ei.incident_received_datetime, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                                        AS crash_timestamp,
    to_char(
        (ei.incident_received_datetime AT TIME ZONE 'America/Chicago'::text),
        'YYYY-MM-DD"T"HH24:MI:SS'::text
    )                                        AS crash_timestamp_ct,
    CASE
        WHEN
            ei.longitude IS NOT NULL AND ei.latitude IS NOT NULL
            THEN
                ((('POINT ('::text || ei.longitude::text) || ' '::text) || ei.latitude::text)
                || ')'::text
        ELSE NULL::text
    END                                      AS point,
    coalesce(
        ei.crash_injry_sev_id = 4, FALSE
    )                                        AS crash_fatal_fl,
    NULL::text                               AS collsn_desc
FROM ems_unmatched_incident_injury_metrics_view ei
LEFT JOIN locations location ON ei.location_id = location.location_id::text
WHERE
    ei.austin_full_purpose = TRUE AND ei.incident_received_datetime < (now() - '14 days'::interval);
