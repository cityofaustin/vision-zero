-- This function inserts a new record into the fatality table and is triggered by fatal insertions to the primaryperson or person tables
CREATE OR REPLACE FUNCTION fatality_insert() 
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
    DECLARE
    	year integer;
        location text;
    BEGIN
    	SELECT TO_CHAR(crash_date,'yyyy')
            FROM atd_txdot_crashes
            WHERE crash_id = NEW.crash_id
            INTO year;
        SELECT CONCAT_WS(' ', rpt_block_num, rpt_street_pfx, rpt_street_name, '(', rpt_sec_block_num, rpt_sec_street_pfx, rpt_sec_street_name, ')')
            FROM atd_txdot_crashes
            WHERE crash_id = NEW.crash_id
            INTO location;
    	IF (TG_TABLE_NAME = 'atd_txdot_primaryperson') THEN
    	    INSERT INTO fatalities (crash_id, primaryperson_id, year, location)
    		    VALUES (NEW.crash_id, NEW.primaryperson_id, year, location);
    	ELSIF (TG_TABLE_NAME = 'atd_txdot_person') THEN
    		INSERT INTO fatalities (crash_id, person_id, year, location)
    		    VALUES (NEW.crash_id, NEW.person_id, year, location);
    	END IF;
    	RETURN NEW;
    END
$function$
;