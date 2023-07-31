-- Trigger function
CREATE OR REPLACE FUNCTION update_noncr3_location()
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
$$
DECLARE 
    found_location_id varchar;

BEGIN
    -- Check if crash is main-lane
	IF EXISTS (SELECT * FROM find_noncr3_mainlane_crash(NEW.case_id)) THEN
        -- If it is, then set the location_id to None
		UPDATE atd_apd_blueform SET location_id = NULL 
        WHERE case_id = NEW.case_id;
    ELSE 
        -- If it isn't, try to find a location_id for it
        SELECT location_id INTO found_location_id FROM find_location_for_noncr3_collision(NEW.case_id);

        -- If the found_location_id is different from the old_location_id, then update the
        IF found_location_id IS NOT NULL AND found_location_id <> OLD.location_id THEN
            UPDATE atd_apd_blueform SET location_id = found_location_id 
            WHERE case_id = NEW.case_id;
        END IF;
    END IF;

	RETURN NEW;
END;
$$

-- Triggers
CREATE TRIGGER update_noncr3_location
AFTER INSERT ON atd_apd_blueform
FOR EACH ROW
WHEN (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
EXECUTE FUNCTION update_noncr3_location();

CREATE TRIGGER update_noncr3_location
AFTER UPDATE ON atd_apd_blueform
FOR EACH ROW
WHEN (OLD.latitude IS DISTINCT FROM NEW.latitude
OR OLD.longitude IS DISTINCT FROM NEW.longitude)
EXECUTE FUNCTION update_noncr3_location();

-- Function for generated column
CREATE OR REPLACE FUNCTION update_noncr3_location(blueform_case_id integer)
  RETURNS varchar 
  LANGUAGE PLPGSQL
  IMMUTABLE
  AS
$$
BEGIN
    -- Check if crash is main-lane
	IF EXISTS (SELECT * FROM find_noncr3_mainlane_crash(blueform_case_id)) THEN
        -- If it is, then set the location_id to None
		RETURN NULL;
    ELSE 
        -- If it isn't main-lane, try to find a location_id for it
        RETURN (SELECT location_id FROM find_location_for_noncr3_collision(blueform_case_id));
    END IF;
END;
$$

-- Test generated column
ALTER TABLE atd_apd_blueform
ADD COLUMN generated_location_id varchar 
GENERATED ALWAYS AS (update_noncr3_location(case_id)) STORED;