ALTER TABLE atd_txdot_locations rename column location_name to description;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection DROP DEFAULT;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection TYPE integer
    USING CASE WHEN is_intersection = TRUE THEN 1 ELSE 0 END;

DROP TRIGGER if exists set_public_atd_txdot_locations_updated_at  ON public.atd_txdot_locations;

ALTER TABLE atd_txdot_locations
    drop column is_signalized,
    drop column is_hin,
    drop column is_service_road,
    drop column council_districts,
    drop column signal_eng_areas,
    drop column area_eng_areas,
    drop column zip_codes,
    drop column apd_sectors,
    drop column street_levels,
    drop column signal_id,
    drop column signal_type,
    drop column signal_status,
    drop column is_deleted,
    drop column created_at,
    drop column updated_at,
    drop column created_by,
    drop column updated_by,
    add column last_update DATE,
    add column scale_factor integer;

alter table geo.non_coa_roadways drop column objectid;

DROP VIEW locations_list_view;
CREATE VIEW locations_list_view AS 
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
          WHERE atd_apd_blueform.location_id IS NOT NULL AND atd_apd_blueform.is_deleted = false AND atd_apd_blueform.case_timestamp > (now() - '5 years'::interval)
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

