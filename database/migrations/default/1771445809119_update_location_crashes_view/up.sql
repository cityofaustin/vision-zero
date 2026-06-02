-- Adds crash_pk to materialized view
DROP MATERIALIZED VIEW "public"."location_crashes_view";
CREATE MATERIALIZED VIEW "public"."location_crashes_view" AS 
 SELECT crashes.record_locator,
    crashes.cris_crash_id,
    crashes.id AS crash_pk,
    'CR3'::text AS type,
    crashes.location_id,
    crashes.case_id,
    crashes.crash_timestamp,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'YYYY-MM-DD'::text) AS crash_date,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'HH24:MI:SS'::text) AS crash_time,
    upper(to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'dy'::text)) AS day_of_week,
    crash_injury_metrics_view.crash_injry_sev_id AS crash_sev_id,
    crashes.latitude,
    crashes.longitude,
    crashes.address_display,
    crash_injury_metrics_view.non_injry_count,
    crash_injury_metrics_view.nonincap_injry_count,
    crash_injury_metrics_view.poss_injry_count,
    crash_injury_metrics_view.sus_serious_injry_count,
    crash_injury_metrics_view.tot_injry_count,
    crash_injury_metrics_view.unkn_injry_count,
    crash_injury_metrics_view.vz_fatality_count,
    crash_injury_metrics_view.est_comp_cost_crash_based,
    collsn.label AS collsn_desc,
    crash_units.movement_desc,
    crash_units.travel_direction,
    crash_units.veh_body_styl_desc,
    crash_units.veh_unit_desc
   FROM (((crashes
     LEFT JOIN LATERAL ( SELECT units.crash_pk,
            string_agg(movt.label, ','::text) AS movement_desc,
            string_agg(trvl_dir.label, ','::text) AS travel_direction,
            string_agg(veh_body_styl.label, ','::text) AS veh_body_styl_desc,
            string_agg(unit_desc.label, ','::text) AS veh_unit_desc
           FROM ((((units
             LEFT JOIN lookups.movt movt ON ((units.movement_id = movt.id)))
             LEFT JOIN lookups.trvl_dir trvl_dir ON ((units.veh_trvl_dir_id = trvl_dir.id)))
             LEFT JOIN lookups.veh_body_styl veh_body_styl ON ((units.veh_body_styl_id = veh_body_styl.id)))
             LEFT JOIN lookups.unit_desc unit_desc ON ((units.unit_desc_id = unit_desc.id)))
          WHERE (crashes.id = units.crash_pk)
          GROUP BY units.crash_pk) crash_units ON (true))
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
          WHERE (crashes.id = crash_injury_metrics_view_1.id)
         LIMIT 1) crash_injury_metrics_view ON (true))
     LEFT JOIN lookups.collsn ON ((crashes.fhe_collsn_id = collsn.id)))
  WHERE (crashes.is_deleted = false)
UNION ALL
 SELECT NULL::text AS record_locator,
    aab.form_id AS cris_crash_id,
    NULL::integer AS crash_pk,
    'NON-CR3'::text AS type,
    aab.location_id,
    (aab.case_id)::text AS case_id,
    aab.case_timestamp AS crash_timestamp,
    to_char((aab.case_timestamp AT TIME ZONE 'US/Central'::text), 'YYYY-MM-DD'::text) AS crash_date,
    to_char((aab.case_timestamp AT TIME ZONE 'US/Central'::text), 'HH24:MI:SS'::text) AS crash_time,
    upper(to_char((aab.case_timestamp AT TIME ZONE 'US/Central'::text), 'dy'::text)) AS day_of_week,
    0 AS crash_sev_id,
    aab.latitude,
    aab.longitude,
    aab.address AS address_display,
    0 AS non_injry_count,
    0 AS nonincap_injry_count,
    0 AS poss_injry_count,
    0 AS sus_serious_injry_count,
    0 AS tot_injry_count,
    0 AS unkn_injry_count,
    0 AS vz_fatality_count,
    aab.est_comp_cost_crash_based,
    ''::text AS collsn_desc,
    ''::text AS movement_desc,
    ''::text AS travel_direction,
    ''::text AS veh_body_styl_desc,
    ''::text AS veh_unit_desc
   FROM atd_apd_blueform aab
  WHERE (aab.is_deleted = false);
