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
            SELECT id
            FROM atd_jurisdictions
            WHERE (atd_jurisdictions.geometry && NEW.position) AND ST_Contains(atd_jurisdictions.geometry, NEW.position)
        )
        LOOP
          IF temprow.id IN (5, 3, 7, 8, 10) THEN
            NEW.city_id = 22;
            RETURN NEW;
          END IF;
        END LOOP;
    RETURN NEW;
    END
$function$
;
