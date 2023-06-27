-- This function determines whether crash coordinates fall within the Austin Full Purpose jurisdiction polygon.
-- If the crash has no coordinates, it returns whether the crash is in Austin (city_id = 5)
CREATE OR REPLACE FUNCTION is_crash_in_austin_full_purpose(location geometry(Geometry,4326), city_id int) RETURNS boolean AS $$
        BEGIN
            -- If we dont have coordinates for the crash and the city_id is Austin (22), return true
            IF (location IS NULL) THEN --TODO: Do we need to handle if city_id is null? If so should that make the afp flag default to false?
                RETURN (city_id = 22);
            -- If we do have coordinates return whether they are within the AFP jurisdiction (5) polygon
            ELSE
                RETURN ((SELECT geometry FROM atd_jurisdictions WHERE id = 5 ) && location) AND (ST_Contains((SELECT geometry FROM atd_jurisdictions WHERE id = 5), location));
            END IF;
        END;
$$ LANGUAGE plpgsql IMMUTABLE;
