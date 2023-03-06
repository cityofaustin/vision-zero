-- This function inserts a new record into the fatality table
-- It is triggered by fatal insertions to the primaryperson or person tables
CREATE OR REPLACE FUNCTION fatality_insert() 
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
    DECLARE
    	year integer;
        location text;
        position geometry;
    BEGIN
        SELECT TO_CHAR(crash_date,'yyyy'), CONCAT_WS(' ', rpt_block_num, rpt_street_pfx, rpt_street_name, '(', rpt_sec_block_num, rpt_sec_street_pfx, rpt_sec_street_name, ')'), austin_full_purpose
            INTO year, location, position
            FROM atd_txdot_crashes
            WHERE crash_id = NEW.crash_id;
    	IF (TG_TABLE_NAME = 'atd_txdot_primaryperson' AND ST_CONTAINS((SELECT geometry FROM atd_jurisdictions WHERE atd_jurisdictions.id = 5), position)) THEN
    	    INSERT INTO fatalities (crash_id, primaryperson_id, year, location)
    		    VALUES (NEW.crash_id, NEW.primaryperson_id, year, location);
    	ELSIF (TG_TABLE_NAME = 'atd_txdot_person' AND in_austin = 'Y') THEN
    		INSERT INTO fatalities (crash_id, person_id, year, location)
    		    VALUES (NEW.crash_id, NEW.person_id, year, location);
    	END IF;
    	RETURN NEW;
    END
$function$
;
