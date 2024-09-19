-- 1. Drop triggers to update location_id on insert and update
DROP TRIGGER IF EXISTS update_cr3_location_on_insert ON atd_txdot_crashes;
DROP TRIGGER IF EXISTS update_cr3_location_on_update ON atd_txdot_crashes;
