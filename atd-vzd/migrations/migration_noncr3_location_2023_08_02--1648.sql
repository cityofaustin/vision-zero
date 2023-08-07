-- Add generated column for non-CR3 crash locations
ALTER TABLE atd_apd_blueform
ADD COLUMN generated_location_id varchar 
GENERATED ALWAYS AS (update_noncr3_location(case_id)) STORED;

-- Drop views that use location_id (replace later with generated location_id)
DROP VIEW IF EXISTS locations_with_crash_injury_counts;
DROP VIEW IF EXISTS view_location_crashes_global;
DROP VIEW IF EXISTS view_location_injry_count_cost_summary;

-- Drop materialized views that use location_id and branch from all_atd_apd_blueform
DROP MATERIALIZED VIEW IF EXISTS all_crashes_off_mainlane;
DROP MATERIALIZED VIEW IF EXISTS all_non_cr3_crashes_off_mainlane;
DROP MATERIALIZED VIEW IF EXISTS all_atd_apd_blueform;

-- Drop materialized views that use location_id and branch from five_year_atd_apd_blueform
DROP MATERIALIZED VIEW IF EXISTS five_year_highway_polygons_with_crash_data;
DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_outside_any_polygons;

DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_outside_surface_polygons;
DROP MATERIALIZED VIEW IF EXISTS five_year_non_cr3_crashes_outside_surface_polygons;

DROP MATERIALIZED VIEW IF EXISTS five_year_surface_polygons_with_crash_data;
DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_off_mainlane_outside_surface_polygons;

DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_off_mainlane;
DROP MATERIALIZED VIEW IF EXISTS five_year_non_cr3_crashes_off_mainlane;

DROP MATERIALIZED VIEW IF EXISTS five_year_atd_apd_blueform;

-- Then, drop current atd_apd_blueform location_id column
ALTER TABLE atd_apd_blueform DROP COLUMN location_id;

-- Rename generated_location_id to location_id to replace it
ALTER TABLE atd_apd_blueform 
RENAME COLUMN generated_location_id TO location_id;

-- TODO add DB views that use location_id

-- all_atd_apd_blueform
-- depends on:
-- column location_id of table atd_apd_blueform
-- 
CREATE OR REPLACE all_atd_apd_blueform
AS
 SELECT c.form_id,
    c.date,
    c.case_id,
    c.address,
    c.longitude,
    c.latitude,
    c.hour,
    c.location_id,
    c.speed_mgmt_points,
    c.est_comp_cost,
    c.est_econ_cost,
    c."position",
    p.location_id AS surface_polygon_hex_id
   FROM atd_apd_blueform c
     LEFT JOIN atd_txdot_locations p ON p.location_group = 1 AND c."position" && p.geometry AND st_contains(p.geometry, c."position")
  WHERE c.date >= ('2020-11-23'::date - '5 years'::interval);

-- Drop functions that were removed and rolled into update_noncr3_location function
DROP FUNCTION find_noncr3_mainlane_crash;
DROP FUNCTION find_location_for_noncr3_collision;

-- all_non_cr3_crashes_off_mainlane
-- depends on: 
-- all_atd_apd_blueform
CREATE OR REPLACE all_non_cr3_crashes_off_mainlane
AS