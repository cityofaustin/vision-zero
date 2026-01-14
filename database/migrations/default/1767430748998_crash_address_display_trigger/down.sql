-- Drop the triggers and trigger functions
DROP TRIGGER IF EXISTS update_crash_address_display ON crashes;
DROP TRIGGER IF EXISTS insert_crash_address_display ON crashes;
DROP FUNCTION IF EXISTS update_crash_address_display();
DROP FUNCTION IF EXISTS generate_crash_address();
DROP FUNCTION IF EXISTS deduplicate_address_parts();
DROP FUNCTION IF EXISTS format_street_address();
DROP FUNCTION IF EXISTS format_highway_address();

-- Recreate the old address_primary and address_secondary columns
ALTER TABLE crashes 
ADD COLUMN address_primary TEXT,
ADD COLUMN address_secondary TEXT;

-- Drop the new address_display column
ALTER TABLE crashes DROP COLUMN IF EXISTS address_display CASCADE;

-- Drop the index on address_display (if it still exists)
DROP INDEX IF EXISTS idx_crashes_address_display;

-- Recreate fatalities_view with original address columns
CREATE
OR REPLACE VIEW "public"."fatalities_view" AS
SELECT
  people.id AS person_id,
  crashes.id AS crash_pk,
  crashes.cris_crash_id,
  crashes.record_locator,
  crashes.longitude,
  crashes.latitude,
  crashes.address_primary,
  units.id AS unit_id,
  concat_ws(
    ' ' :: text,
    people.prsn_first_name,
    people.prsn_mid_name,
    people.prsn_last_name
  ) AS victim_name,
  to_char(
    (
      crashes.crash_timestamp AT TIME ZONE 'US/Central' :: text
    ),
    'yyyy' :: text
  ) AS year,
  crashes.crash_timestamp,
  concat_ws(
    ' ' :: text,
    crashes.rpt_block_num,
    crashes.rpt_street_pfx,
    crashes.rpt_street_name,
    '(',
    crashes.rpt_sec_block_num,
    crashes.rpt_sec_street_pfx,
    crashes.rpt_sec_street_name,
    ')'
  ) AS location,
  to_char(
    (
      crashes.crash_timestamp AT TIME ZONE 'US/Central' :: text
    ),
    'YYYY-MM-DD' :: text
  ) AS crash_date_ct,
  to_char(
    (
      crashes.crash_timestamp AT TIME ZONE 'US/Central' :: text
    ),
    'HH24:MI:SS' :: text
  ) AS crash_time_ct,
  row_number() OVER (
    PARTITION BY (
      EXTRACT(
        year
        FROM
          (
            crashes.crash_timestamp AT TIME ZONE 'US/Central' :: text
          )
      )
    )
    ORDER BY
      (
        (
          crashes.crash_timestamp AT TIME ZONE 'US/Central' :: text
        )
      )
  ) AS ytd_fatality,
  dense_rank() OVER (
    PARTITION BY (
      EXTRACT(
        year
        FROM
          (
            crashes.crash_timestamp AT TIME ZONE 'US/Central' :: text
          )
      )
    )
    ORDER BY
      (
        (
          crashes.crash_timestamp AT TIME ZONE 'US/Central' :: text
        )
      ),
      crashes.id
  ) AS ytd_fatal_crash,
  crashes.case_id,
  crashes.law_enforcement_ytd_fatality_num,
  crashes.engineering_area_id
FROM
  (
    (
      people
      LEFT JOIN units ON ((people.unit_id = units.id))
    )
    LEFT JOIN crashes ON ((units.crash_pk = crashes.id))
  )
WHERE
  (
    (crashes.in_austin_full_purpose = true)
    AND (people.prsn_injry_sev_id = 4)
    AND (crashes.private_dr_fl = false)
    AND (crashes.is_deleted = false)
  );


-- Recreate socrata_export_crashes_view with original address columns
create or replace view public.socrata_export_crashes_view as
with unit_aggregates as (
    select
        crashes_1.id,
        string_agg(
            distinct mode_categories.label, ' & '::text
        ) as units_involved
    from crashes as crashes_1
    left join units on crashes_1.id = units.crash_pk
    left join
        lookups.mode_category as mode_categories
        on units.vz_mode_category_id = mode_categories.id
    group by crashes_1.id
)

select
    crashes.id,
    crashes.cris_crash_id,
    crashes.case_id,
    crashes.is_deleted,
    crashes.latitude,
    crashes.longitude,
    crashes.address_primary,
    crashes.address_secondary,
    crashes.rpt_block_num,
    crashes.rpt_street_name,
    crashes.rpt_street_pfx,
    crashes.rpt_street_sfx,
    location.location_id,
    location.location_group,
    crashes.crash_speed_limit,
    crashes.road_constr_zone_fl,
    crashes.is_temp_record,
    cimv.crash_injry_sev_id as crash_sev_id,
    cimv.sus_serious_injry_count as sus_serious_injry_cnt,
    cimv.nonincap_injry_count as nonincap_injry_cnt,
    cimv.poss_injry_count as poss_injry_cnt,
    cimv.non_injry_count as non_injry_cnt,
    cimv.unkn_injry_count as unkn_injry_cnt,
    cimv.tot_injry_count as tot_injry_cnt,
    cimv.est_comp_cost_crash_based,
    cimv.est_total_person_comp_cost,
    cimv.law_enf_fatality_count,
    cimv.vz_fatality_count as death_cnt,
    crashes.onsys_fl,
    crashes.private_dr_fl,
    unit_aggregates.units_involved,
    cimv.motor_vehicle_fatality_count as motor_vehicle_death_count,
    cimv.motor_vehicle_sus_serious_injry_count as motor_vehicle_serious_injury_count,
    cimv.bicycle_fatality_count as bicycle_death_count,
    cimv.bicycle_sus_serious_injry_count as bicycle_serious_injury_count,
    cimv.pedestrian_fatality_count as pedestrian_death_count,
    cimv.pedestrian_sus_serious_injry_count as pedestrian_serious_injury_count,
    cimv.motorcycle_fatality_count as motorcycle_death_count,
    cimv.motorcycle_sus_serious_count as motorcycle_serious_injury_count,
    cimv.micromobility_fatality_count as micromobility_death_count,
    cimv.micromobility_sus_serious_injry_count as micromobility_serious_injury_count,
    cimv.other_fatality_count as other_death_count,
    cimv.other_sus_serious_injry_count as other_serious_injury_count,
    cimv.years_of_life_lost,
    to_char(
        crashes.crash_timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) as crash_timestamp,
    to_char(
        (crashes.crash_timestamp at time zone 'US/Central'::text),
        'YYYY-MM-DD"T"HH24:MI:SS'::text
    ) as crash_timestamp_ct,
    case
        when
            crashes.latitude is not NULL and crashes.longitude is not NULL
            then
                (
                    (('POINT ('::text || crashes.longitude::text) || ' '::text)
                    || crashes.latitude::text
                )
                || ')'::text
        else NULL::text
    end as point,
    coalesce(cimv.crash_injry_sev_id = 4, FALSE) as crash_fatal_fl
from crashes
left join lateral (select
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
from crash_injury_metrics_view
where crashes.id = crash_injury_metrics_view.id
limit 1) as cimv on TRUE
left join lateral (select
    unit_aggregates_1.id,
    unit_aggregates_1.units_involved
from unit_aggregates as unit_aggregates_1
where crashes.id = unit_aggregates_1.id
limit 1) as unit_aggregates on TRUE
left join
    locations as location
    on crashes.location_id = location.location_id
where
    crashes.is_deleted = FALSE
    and crashes.in_austin_full_purpose = TRUE
    and crashes.private_dr_fl = FALSE
    and crashes.crash_timestamp < (now() - '14 days'::interval)
order by crashes.id;


-- Recreate this with old address columns
drop view if exists "public"."crashes_list_view" cascade;

CREATE OR REPLACE VIEW "public"."crashes_list_view" AS 
 WITH geocode_status AS (
         SELECT cris.id,
            (((unified.latitude IS NOT NULL) AND (unified.latitude IS DISTINCT FROM cris.latitude)) OR ((unified.longitude IS NOT NULL) AND (unified.longitude IS DISTINCT FROM cris.longitude))) AS is_manual_geocode
           FROM (crashes_cris cris
             LEFT JOIN crashes unified ON ((cris.id = unified.id)))
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
    crashes.is_coa_roadway,
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
    crash_injury_metrics_view.est_total_person_comp_cost,
    crash_injury_metrics_view.crash_injry_sev_id,
    crash_injury_metrics_view.years_of_life_lost,
    injry_sev.label AS crash_injry_sev_desc,
    collsn.label AS collsn_desc,
    geocode_status.is_manual_geocode,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'YYYY-MM-DD'::text) AS crash_date_ct,
    to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'HH24:MI:SS'::text) AS crash_time_ct,
    upper(to_char((crashes.crash_timestamp AT TIME ZONE 'US/Central'::text), 'dy'::text)) AS crash_day_of_week
   FROM ((((crashes
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
     LEFT JOIN geocode_status ON ((crashes.id = geocode_status.id)))
     LEFT JOIN lookups.collsn ON ((crashes.fhe_collsn_id = collsn.id)))
     LEFT JOIN lookups.injry_sev ON ((crash_injury_metrics_view.crash_injry_sev_id = injry_sev.id)))
  WHERE (crashes.is_deleted = false)
  ORDER BY crashes.crash_timestamp DESC;


-- Recreate this view
CREATE OR REPLACE VIEW public.locations_list_view
AS WITH cr3_comp_costs AS (
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
          WHERE atd_apd_blueform.location_id IS NOT NULL AND atd_apd_blueform.is_deleted = false AND atd_apd_blueform.case_timestamp > (now() - '5 years'::interval)
          GROUP BY atd_apd_blueform.location_id
        )
 SELECT locations.location_id,
    locations.location_name,
    locations.council_district,
    locations.location_group,
    COALESCE(cr3_comp_costs.cr3_comp_costs_total + non_cr3_crash_counts.noncr3_comp_costs_total, 0::bigint) AS total_est_comp_cost,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) AS cr3_crash_count,
    COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS non_cr3_crash_count,
    COALESCE(cr3_crash_counts.crash_count, 0::bigint) + COALESCE(non_cr3_crash_counts.crash_count, 0::bigint) AS crash_count
   FROM locations
     LEFT JOIN cr3_crash_counts ON locations.location_id::text = cr3_crash_counts.location_id
     LEFT JOIN non_cr3_crash_counts ON locations.location_id::text = non_cr3_crash_counts.location_id::text
     LEFT JOIN cr3_comp_costs ON locations.location_id::text = cr3_comp_costs.location_id;


-- Recreate this materialized view with old address columns
DROP MATERIALIZED VIEW IF EXISTS "public"."location_crashes_view";
CREATE MATERIALIZED VIEW public.location_crashes_view
TABLESPACE pg_default
AS SELECT crashes.record_locator,
    crashes.cris_crash_id,
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
    crashes.address_primary,
    crashes.address_secondary,
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
   FROM crashes
     LEFT JOIN LATERAL ( SELECT units.crash_pk,
            string_agg(movt.label, ','::text) AS movement_desc,
            string_agg(trvl_dir.label, ','::text) AS travel_direction,
            string_agg(veh_body_styl.label, ','::text) AS veh_body_styl_desc,
            string_agg(unit_desc.label, ','::text) AS veh_unit_desc
           FROM units
             LEFT JOIN lookups.movt movt ON units.movement_id = movt.id
             LEFT JOIN lookups.trvl_dir trvl_dir ON units.veh_trvl_dir_id = trvl_dir.id
             LEFT JOIN lookups.veh_body_styl veh_body_styl ON units.veh_body_styl_id = veh_body_styl.id
             LEFT JOIN lookups.unit_desc unit_desc ON units.unit_desc_id = unit_desc.id
          WHERE crashes.id = units.crash_pk
          GROUP BY units.crash_pk) crash_units ON true
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
     LEFT JOIN lookups.collsn ON crashes.fhe_collsn_id = collsn.id
  WHERE crashes.is_deleted = false
UNION ALL
 SELECT NULL::text AS record_locator,
    aab.form_id AS cris_crash_id,
    'NON-CR3'::text AS type,
    aab.location_id,
    aab.case_id::text AS case_id,
    aab.case_timestamp AS crash_timestamp,
    to_char((aab.case_timestamp AT TIME ZONE 'US/Central'::text), 'YYYY-MM-DD'::text) AS crash_date,
    to_char((aab.case_timestamp AT TIME ZONE 'US/Central'::text), 'HH24:MI:SS'::text) AS crash_time,
    upper(to_char((aab.case_timestamp AT TIME ZONE 'US/Central'::text), 'dy'::text)) AS day_of_week,
    0 AS crash_sev_id,
    aab.latitude,
    aab.longitude,
    aab.address AS address_primary,
    ''::text AS address_secondary,
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
  WHERE aab.is_deleted = false
WITH DATA;

-- View indexes:
CREATE INDEX location_crashes_view_crash_timestamp_idx ON public.location_crashes_view USING btree (crash_timestamp);
CREATE INDEX location_crashes_view_location_id_idx ON public.location_crashes_view USING btree (location_id);
CREATE INDEX location_crashes_view_record_locator_idx ON public.location_crashes_view USING btree (record_locator);