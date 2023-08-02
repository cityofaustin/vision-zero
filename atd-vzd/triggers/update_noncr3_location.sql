-- Function for atd_apd_blueform generated column called location_id
CREATE OR REPLACE FUNCTION update_noncr3_location(blueform_case_id integer)
  RETURNS varchar 
  LANGUAGE PLPGSQL
  IMMUTABLE
  AS
$$
BEGIN
    -- Check if crash is main-lane and of concern to TxDOT
	IF EXISTS (SELECT * FROM find_noncr3_mainlane_crash(blueform_case_id)) THEN
        -- If it is, then set the location_id to None
		RETURN NULL;
    ELSE 
        -- If it isn't main-lane and of concern to Vision Zero, try to find a location_id for it
        RETURN (SELECT location_id FROM find_location_for_noncr3_collision(blueform_case_id));
    END IF;
END;
$$
