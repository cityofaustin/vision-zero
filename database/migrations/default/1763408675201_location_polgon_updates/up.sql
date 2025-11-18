-- remove redundant indexes
ALTER TABLE atd_txdot_locations 
  DROP CONSTRAINT atd_txdot_locations_unique_id_key;

DROP INDEX atd_txdot_locations_unique_id_uindex;

-- convert is_intersection to boolean
ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection DROP DEFAULT;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection TYPE bool
    USING CASE WHEN is_intersection = 0 THEN FALSE ELSE TRUE END;

ALTER TABLE atd_txdot_locations ALTER COLUMN is_intersection SET DEFAULT FALSE;

-- add new fields
ALTER TABLE atd_txdot_locations
    add column is_signalized boolean,
    add column is_hin boolean,
    add column is_service_road boolean,
    add column council_districts integer[],
    add column signal_eng_areas text[],
    add column area_eng_areas text[],
    add column zip_codes text[],
    add column apd_sectors text[],
    add column street_levels integer[],
    add column signal_id integer,
    add column signal_type text,
    add column signal_status text,
    add column is_deleted boolean not null default false;

-- add pk column to non-coa roadways
alter table geo.non_coa_roadways add column objectid integer;
update geo.non_coa_roadways set objectid = 1;
alter table geo.non_coa_roadways add primary key (objectid);


-- rename location description and update view
ALTER TABLE atd_txdot_locations rename column description to location_name;

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
    locations.location_name,
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
