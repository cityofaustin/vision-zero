-- Summary for trigger
-- 1. Fire trigger on insert or update of atd_apd_blueform table
-- 2. Check if crash is main-lane using find_noncr3_mainlane_crash function in DB ✅
-- 3. If it is, then set the location_id to None ✅
-- 4. If it isn't, try to find the location_id with find_location_for_noncr3_collision function in DB
-- 5. If the new_location_id is the same as the old_location_id, then do nothing
-- 6. If the new_location_id is different from the old_location_id, then update the location_id with update_atd_apd_blueform function in DB

-- Trigger function
CREATE OR REPLACE FUNCTION update_noncr3_location()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
$$
DECLARE 
    found_location_id varchar;

BEGIN
	IF EXISTS find_noncr3_mainlane_crash(NEW.case_id) THEN
		 UPDATE atd_apd_blueform SET location_id = NULL 
         WHERE case_id = NEW.case_id;
    ELSE 
        SELECT location_id INTO found_location_id FROM find_location_for_noncr3_collision(NEW.case_id);

        IF found_location_id IS NOT NULL AND found_location_id <> OLD.location_id THEN
            UPDATE atd_apd_blueform SET location_id = found_location_id 
            WHERE case_id = NEW.case_id;
        END IF;
    END IF;

	RETURN NEW;
END;
$$

-- Trigger
CREATE TRIGGER update_noncr3_location
AFTER UPDATE ON atd_apd_blueform_update_location
FOR EACH ROW
WHEN (OLD.latitude IS DISTINCT FROM NEW.latitude
OR OLD.longitude IS DISTINCT FROM NEW.longitude)
EXECUTE FUNCTION update_noncr3_location();