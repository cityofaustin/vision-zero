-- 1. Add triggers to update location_id on insert and update
CREATE TRIGGER update_noncr3_location_on_insert
AFTER INSERT ON atd_apd_blueform
FOR EACH ROW
WHEN (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
EXECUTE PROCEDURE update_noncr3_location();

CREATE TRIGGER update_noncr3_location_on_update
AFTER UPDATE ON atd_apd_blueform
FOR EACH ROW
WHEN (OLD.latitude IS DISTINCT FROM NEW.latitude
OR OLD.longitude IS DISTINCT FROM NEW.longitude)
EXECUTE PROCEDURE update_noncr3_location();

-- 3. Add index on non_cr3_mainlanes geometries
CREATE INDEX non_cr3_mainlanes_geom_idx ON non_cr3_mainlanes
USING GIST (geometry);

-- 3. Drop materialized views that use location_id and branch from all_atd_apd_blueform
DROP MATERIALIZED VIEW IF EXISTS all_crashes_off_mainlane;
DROP MATERIALIZED VIEW IF EXISTS all_non_cr3_crashes_off_mainlane;
DROP MATERIALIZED VIEW IF EXISTS all_atd_apd_blueform;

-- 4. Drop materialized views that use location_id and branch from five_year_atd_apd_blueform
DROP MATERIALIZED VIEW IF EXISTS five_year_highway_polygons_with_crash_data;
DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_outside_any_polygons;

DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_outside_surface_polygons;
DROP MATERIALIZED VIEW IF EXISTS five_year_non_cr3_crashes_outside_surface_polygons;

DROP MATERIALIZED VIEW IF EXISTS five_year_surface_polygons_with_crash_data;
DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_off_mainlane_outside_surface_polygons;

DROP MATERIALIZED VIEW IF EXISTS five_year_all_crashes_off_mainlane;
DROP MATERIALIZED VIEW IF EXISTS five_year_non_cr3_crashes_off_mainlane;

DROP MATERIALIZED VIEW IF EXISTS five_year_atd_apd_blueform;

-- 5. Drop functions that were removed and rolled into update_noncr3_location function
DROP FUNCTION find_noncr3_mainlane_crash;
DROP FUNCTION find_location_for_noncr3_collision;
