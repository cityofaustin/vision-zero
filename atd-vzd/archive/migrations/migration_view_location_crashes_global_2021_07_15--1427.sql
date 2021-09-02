-- update view to use the crash based comprehensive cost values
-- This view is also found in atd-vzd/views/view_location_injry_count_cost_summary-schema.sql
CREATE OR REPLACE VIEW public.view_location_crashes_global
AS SELECT atc.crash_id,
    'CR3'::text AS type,
    atc.location_id,
    atc.case_id,
    atc.crash_date,
    atc.crash_time,
    atc.day_of_week,
    atc.crash_sev_id,
    atc.longitude_primary,
    atc.latitude_primary,
    atc.address_confirmed_primary,
    atc.address_confirmed_secondary,
    atc.non_injry_cnt,
    atc.nonincap_injry_cnt,
    atc.poss_injry_cnt,
    atc.sus_serious_injry_cnt,
    atc.tot_injry_cnt,
    atc.death_cnt,
    atc.unkn_injry_cnt,
    atc.est_comp_cost_crash_based as est_comp_cost,
    string_agg(atcl.collsn_desc::text, ','::text) AS collsn_desc,
    string_agg(attdl.trvl_dir_desc::text, ','::text) AS travel_direction,
    string_agg(atml.movement_desc::text, ','::text) AS movement_desc,
    string_agg(atvbsl.veh_body_styl_desc::text, ','::text) AS veh_body_styl_desc,
    string_agg(atvudl.veh_unit_desc_desc, ','::text) AS veh_unit_desc_desc
   FROM atd_txdot_crashes atc
     LEFT JOIN atd_txdot__collsn_lkp atcl ON atc.fhe_collsn_id = atcl.collsn_id
     LEFT JOIN atd_txdot_units atu ON atc.crash_id = atu.crash_id
     LEFT JOIN atd_txdot__trvl_dir_lkp attdl ON atu.travel_direction = attdl.trvl_dir_id
     LEFT JOIN atd_txdot__movt_lkp atml ON atu.movement_id = atml.movement_id
     LEFT JOIN atd_txdot__veh_body_styl_lkp atvbsl ON atu.veh_body_styl_id = atvbsl.veh_body_styl_id
     LEFT JOIN atd_txdot__veh_unit_desc_lkp atvudl ON atu.unit_desc_id = atvudl.veh_unit_desc_id
  WHERE atc.crash_date >= (now() - '5 years'::interval)::date
  GROUP BY atc.crash_id, atc.location_id, atc.case_id, atc.crash_date, atc.crash_time, atc.day_of_week, atc.crash_sev_id, atc.longitude_primary, atc.latitude_primary, atc.address_confirmed_primary, atc.address_confirmed_secondary, atc.non_injry_cnt, atc.nonincap_injry_cnt, atc.poss_injry_cnt, atc.sus_serious_injry_cnt, atc.tot_injry_cnt, atc.death_cnt, atc.unkn_injry_cnt, atc.est_comp_cost
UNION ALL
 SELECT aab.form_id AS crash_id,
    'NON-CR3'::text AS type,
    aab.location_id,
    aab.case_id::text AS case_id,
    aab.date AS crash_date,
    concat(aab.hour, ':00:00')::time without time zone AS crash_time,
    ( SELECT
                CASE date_part('dow'::text, aab.date)
                    WHEN 0 THEN 'SUN'::text
                    WHEN 1 THEN 'MON'::text
                    WHEN 2 THEN 'TUE'::text
                    WHEN 3 THEN 'WED'::text
                    WHEN 4 THEN 'THU'::text
                    WHEN 5 THEN 'FRI'::text
                    WHEN 6 THEN 'SAT'::text
                    ELSE 'Unknown'::text
                END AS "case") AS day_of_week,
    0 AS crash_sev_id,
    aab.longitude AS longitude_primary,
    aab.latitude AS latitude_primary,
    aab.address AS address_confirmed_primary,
    ''::text AS address_confirmed_secondary,
    0 AS non_injry_cnt,
    0 AS nonincap_injry_cnt,
    0 AS poss_injry_cnt,
    0 AS sus_serious_injry_cnt,
    0 AS tot_injry_cnt,
    0 AS death_cnt,
    0 AS unkn_injry_cnt,
    aab.est_comp_cost_crash_based as est_comp_cost,
    ''::text AS collsn_desc,
    ''::text AS travel_direction,
    ''::text AS movement_desc,
    ''::text AS veh_body_styl_desc,
    ''::text AS veh_unit_desc_desc
   FROM atd_apd_blueform aab
  WHERE aab.date >= (now() - '5 years'::interval)::date;

-- set ownership if needed
ALTER TABLE public.view_location_crashes_global OWNER TO atd_vz_data;
