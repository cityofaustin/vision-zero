-- This function is invoked by a generated column in atd_txdot_crashes called council_district and returns which council district
-- the coordinates of the crash fall within.
CREATE OR REPLACE FUNCTION find_council_district(location geometry(Geometry,4326)) RETURNS integer AS $$
        BEGIN
            -- If we dont have coordinates for the crash return null
            IF (location IS NULL) THEN
                RETURN null;
            -- If we do have coordinates return which council district they fall within
            ELSE
                RETURN (SELECT council_district FROM council_districts WHERE (council_districts.geometry && location) AND ST_Contains(council_districts.geometry, location));
            END IF;
        END;
$$ LANGUAGE plpgsql IMMUTABLE;
