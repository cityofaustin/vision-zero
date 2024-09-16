-- 1. Drop triggers to update location_id on insert and update
DROP TRIGGER IF EXISTS update_noncr3_location_on_insert ON atd_apd_blueform;
DROP TRIGGER IF EXISTS update_noncr3_location_on_update ON atd_apd_blueform;

-- 2. Remove index on non_cr3_mainlanes geometries
DROP INDEX IF EXISTS non_cr3_mainlanes_geom_idx;
