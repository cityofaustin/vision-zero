-- Summary for trigger
-- 1. Fire trigger on insert or update of atd_apd_blueform table
-- 2. Check if crash is main-lane using find_noncr3_mainlane_crash function in DB
-- 3. If it is, then set the location_id to None
-- 4. If it isn't, try to find the location_id with find_location_for_noncr3_collision function in DB
-- 5. If the new_location_id is the same as the old_location_id, then do nothing
-- 6. If the new_location_id is different from the old_location_id, then update the location_id with update_atd_apd_blueform function in DB

-- Trigger template
CREATE TRIGGER update_noncr3_location
AFTER UPDATE ON atd_apd_blueform_update_location
FOR EACH ROW
WHEN (OLD.latitude IS DISTINCT FROM NEW.latitude
OR OLD.longitude IS DISTINCT FROM NEW.longitude)
EXECUTE FUNCTION notify_insert_account_details();