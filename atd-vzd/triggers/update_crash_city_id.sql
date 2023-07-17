-- This function updates the city id if a crashes position is moved into Austin
CREATE OR REPLACE FUNCTION update_crash_city_id()
    RETURNS trigger
    LANGUAGE plpgsql
AS $function$
DECLARE 
temprow RECORD;
    BEGIN
        -- loop through jurisdictions that contain the new position
        -- if jurisdiction is in the list of valid jurisdictions then
        -- update city id to be in Austin (22)
        FOR temprow IN 
        (
            SELECT jurisdictions.id
        FROM atd_txdot_crashes AS crashes
            INNER JOIN atd_jurisdictions jurisdictions
            ON (jurisdictions.geometry && NEW.position) AND ST_Contains(jurisdictions.geometry, NEW.position)
        WHERE crashes.crash_id = NEW.crash_id
        )
        LOOP
          IF temprow.id IN (5, 3, 7, 8, 10) THEN
            NEW.city_id = 22
            RETURN NEW   
          END IF;
        END LOOP;
    RETURN NEW
    END
$function$
;
