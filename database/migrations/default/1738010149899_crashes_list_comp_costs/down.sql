drop view if exists locations_list_view;
drop view if exists crashes_list_view;

-- 
-- restore crashes_list_view
---
create view crashes_list_view 
 as WITH geocode_status AS (
         SELECT cris.id,
            unified.latitude IS NOT NULL AND unified.latitude IS DISTINCT FROM cris.latitude OR unified.longitude IS NOT NULL AND unified.longitude IS DISTINCT FROM cris.longitude AS is_manual_geocode
           FROM crashes_cris cris
             LEFT JOIN crashes unified ON cris.id = unified.id
        )
 SELECT crashes.id,
    crashes.cris_crash_id,
    crashes.record_locator,
    crashes.case_id,
    crashes.crash_timestamp,
    crashes.address_primary,
    crashes.address_secondary,
    crashes.private_dr_fl,
    crashes.in_austin_full_purpose,
    crashes.location_id,
    crashes.rpt_block_num,
    crashes.rpt_street_pfx,
    crashes.rpt_street_sfx,
    crashes.rpt_street_name,
    crashes.rpt_sec_block_num,
    crashes.rpt_sec_street_pfx,
    crashes.rpt_sec_street_sfx,
    crashes.rpt_sec_street_name,
    crashes.latitude,
    crashes.longitude,
    crashes.light_cond_id,
    crashes.wthr_cond_id,
    crashes.active_school_zone_fl,
    crashes.schl_bus_fl,
    crashes.at_intrsct_fl,
    crashes.onsys_fl,
    crashes.traffic_cntl_id,
    crashes.road_constr_zone_fl,
    crashes.rr_relat_fl,
    crashes.toll_road_fl,
    crashes.intrsct_relat_id,
    crashes.obj_struck_id,
    crashes.crash_speed_limit,
    crashes.council_district,
    crashes.is_temp_record,
    crash_injury_metrics_view.nonincap_injry_count,
    crash_injury_metrics_view.poss_injry_count,
    crash_injury_metrics_view.sus_serious_injry_count,
    crash_injury_metrics_view.non_injry_count,
    crash_injury_metrics_view.tot_injry_count,
    crash_injury_metrics_view.vz_fatality_count,
    crash_injury_metrics_view.cris_fatality_count,
    crash_injury_metrics_view.law_enf_fatality_count,
    crash_injury_metrics_view.fatality_count,
    crash_injury_metrics_view.unkn_injry_count,
    crash_injury_metrics_view.est_comp_cost_crash_based,
    crash_injury_metrics_view.crash_injry_sev_id,
    crash_injury_metrics_view.years_of_life_lost,
    injry_sev.label AS crash_injry_sev_desc,
    collsn.label AS collsn_desc,
    geocode_status.is_manual_geocode,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'YYYY-MM-DD'::text) AS crash_date_ct,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'HH24:MI:SS'::text) AS crash_time_ct,
    upper(to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'dy'::text)) AS crash_day_of_week
   FROM crashes
     LEFT JOIN LATERAL ( SELECT crash_injury_metrics_view_1.id,
            crash_injury_metrics_view_1.cris_crash_id,
            crash_injury_metrics_view_1.unkn_injry_count,
            crash_injury_metrics_view_1.nonincap_injry_count,
            crash_injury_metrics_view_1.poss_injry_count,
            crash_injury_metrics_view_1.non_injry_count,
            crash_injury_metrics_view_1.sus_serious_injry_count,
            crash_injury_metrics_view_1.tot_injry_count,
            crash_injury_metrics_view_1.fatality_count,
            crash_injury_metrics_view_1.vz_fatality_count,
            crash_injury_metrics_view_1.law_enf_fatality_count,
            crash_injury_metrics_view_1.cris_fatality_count,
            crash_injury_metrics_view_1.motor_vehicle_fatality_count,
            crash_injury_metrics_view_1.motor_vehicle_sus_serious_injry_count,
            crash_injury_metrics_view_1.motorcycle_fatality_count,
            crash_injury_metrics_view_1.motorcycle_sus_serious_count,
            crash_injury_metrics_view_1.bicycle_fatality_count,
            crash_injury_metrics_view_1.bicycle_sus_serious_injry_count,
            crash_injury_metrics_view_1.pedestrian_fatality_count,
            crash_injury_metrics_view_1.pedestrian_sus_serious_injry_count,
            crash_injury_metrics_view_1.micromobility_fatality_count,
            crash_injury_metrics_view_1.micromobility_sus_serious_injry_count,
            crash_injury_metrics_view_1.other_fatality_count,
            crash_injury_metrics_view_1.other_sus_serious_injry_count,
            crash_injury_metrics_view_1.crash_injry_sev_id,
            crash_injury_metrics_view_1.years_of_life_lost,
            crash_injury_metrics_view_1.est_comp_cost_crash_based,
            crash_injury_metrics_view_1.est_total_person_comp_cost
           FROM crash_injury_metrics_view crash_injury_metrics_view_1
          WHERE crashes.id = crash_injury_metrics_view_1.id
         LIMIT 1) crash_injury_metrics_view ON true
     LEFT JOIN geocode_status ON crashes.id = geocode_status.id
     LEFT JOIN lookups.collsn ON crashes.fhe_collsn_id = collsn.id
     LEFT JOIN lookups.injry_sev ON crash_injury_metrics_view.crash_injry_sev_id = injry_sev.id
  WHERE crashes.is_deleted = false
  ORDER BY crashes.crash_timestamp DESC;

--
-- restore locations_list_view
--
create view locations_list_view as
  WITH cr3_comp_costs AS (
         SELECT crashes_list_view.location_id,
            sum(crashes_list_view.est_comp_cost_crash_based) AS cr3_comp_costs_total
           FROM crashes_list_view
          WHERE crashes_list_view.crash_timestamp > (now() - '5 years'::interval)
          GROUP BY crashes_list_view.location_id
        ), cr3_crash_counts AS (
         SELECT crashes.location_id,
            count(crashes.location_id) AS crash_count
           FROM crashes
          WHERE crashes.private_dr_fl = false AND crashes.location_id IS NOT NULL AND crashes.crash_timestamp > (now() - '5 years'::interval)
          GROUP BY crashes.location_id
        ), non_cr3_crash_counts AS (
         SELECT atd_apd_blueform.location_id,
            count(atd_apd_blueform.location_id) AS crash_count,
            count(atd_apd_blueform.location_id) * 10000 AS noncr3_comp_costs_total
           FROM atd_apd_blueform
          WHERE atd_apd_blueform.location_id IS NOT NULL AND atd_apd_blueform.date > (now() - '5 years'::interval)
          GROUP BY atd_apd_blueform.location_id
        )
 SELECT locations.location_id,
    locations.description,
    locations.council_district,
    locations.location_group,
    COALESCE(cr3_comp_costs.cr3_comp_costs_total + non_cr3_crash_counts.noncr3_comp_costs_total, 0::bigint) AS total_est_comp_cost,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) AS cr3_crash_count,
    COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS non_cr3_crash_count,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) + COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS crash_count
   FROM atd_txdot_locations locations
     LEFT JOIN cr3_crash_counts ON locations.location_id::text = cr3_crash_counts.location_id
     LEFT JOIN non_cr3_crash_counts ON locations.location_id::text = non_cr3_crash_counts.location_id::text
     LEFT JOIN cr3_comp_costs ON locations.location_id::text = cr3_comp_costs.location_id;

--
-- restore socrata_export_crashes_view
--
drop view if exists socrata_export_crashes_view;

create view socrata_export_crashes_view as
 WITH unit_aggregates AS (
         SELECT crashes_1.id,
            string_agg(DISTINCT mode_categories.label, ' & '::text) AS units_involved
           FROM crashes crashes_1
             LEFT JOIN units ON crashes_1.id = units.crash_pk
             LEFT JOIN lookups.mode_category mode_categories ON units.vz_mode_category_id = mode_categories.id
          GROUP BY crashes_1.id
        )
 SELECT crashes.id,
    crashes.cris_crash_id,
    crashes.case_id,
    crashes.address_primary,
    crashes.address_secondary,
    crashes.is_deleted,
    crashes.latitude,
    crashes.longitude,
    crashes.rpt_block_num,
    crashes.rpt_street_name,
    crashes.rpt_street_sfx,
    crashes.crash_speed_limit,
    crashes.road_constr_zone_fl,
    crashes.is_temp_record,
    cimv.crash_injry_sev_id AS crash_sev_id,
    cimv.sus_serious_injry_count AS sus_serious_injry_cnt,
    cimv.nonincap_injry_count AS nonincap_injry_cnt,
    cimv.poss_injry_count AS poss_injry_cnt,
    cimv.non_injry_count AS non_injry_cnt,
    cimv.unkn_injry_count AS unkn_injry_cnt,
    cimv.tot_injry_count AS tot_injry_cnt,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost,
    cimv.law_enf_fatality_count,
    cimv.vz_fatality_count AS death_cnt,
    crashes.onsys_fl,
    crashes.private_dr_fl,
    unit_aggregates.units_involved,
    cimv.motor_vehicle_fatality_count AS motor_vehicle_death_count,
    cimv.motor_vehicle_sus_serious_injry_count AS motor_vehicle_serious_injury_count,
    cimv.bicycle_fatality_count AS bicycle_death_count,
    cimv.bicycle_sus_serious_injry_count AS bicycle_serious_injury_count,
    cimv.pedestrian_fatality_count AS pedestrian_death_count,
    cimv.pedestrian_sus_serious_injry_count AS pedestrian_serious_injury_count,
    cimv.motorcycle_fatality_count AS motorcycle_death_count,
    cimv.motorcycle_sus_serious_count AS motorcycle_serious_injury_count,
    cimv.micromobility_fatality_count AS micromobility_death_count,
    cimv.micromobility_sus_serious_injry_count AS micromobility_serious_injury_count,
    cimv.other_fatality_count AS other_death_count,
    cimv.other_sus_serious_injry_count AS other_serious_injury_count,
    cimv.years_of_life_lost,
    to_char(crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'YYYY-MM-DD"T"HH24:MI:SS'::text) AS crash_timestamp_ct,
        CASE
            WHEN crashes.latitude IS NOT NULL AND crashes.longitude IS NOT NULL THEN ((('POINT ('::text || crashes.longitude::text) || ' '::text) || crashes.latitude::text) || ')'::text
            ELSE NULL::text
        END AS point,
    COALESCE(cimv.crash_injry_sev_id = 4, false) AS crash_fatal_fl
   FROM crashes
     LEFT JOIN LATERAL ( SELECT crash_injury_metrics_view.id,
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
         LIMIT 1) cimv ON true
     LEFT JOIN LATERAL ( SELECT unit_aggregates_1.id,
            unit_aggregates_1.units_involved
           FROM unit_aggregates unit_aggregates_1
          WHERE crashes.id = unit_aggregates_1.id
         LIMIT 1) unit_aggregates ON true
  WHERE crashes.is_deleted = false AND crashes.in_austin_full_purpose = true AND crashes.private_dr_fl = false AND crashes.crash_timestamp < (now() - '14 days'::interval)
  ORDER BY crashes.id;