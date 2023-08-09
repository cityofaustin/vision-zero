-- This function is invoked by a stored generated column called location_id in the atd_txdot_crashes table.
-- It is responsible for finding the location id of a crash.
CREATE OR REPLACE FUNCTION get_cr3_location_id(
    location geometry(Geometry,4326), 
    crash_id integer, rpt_road_part_id integer, 
    rpt_hwy_num text)
    RETURNS text AS $$
        BEGIN
            -- If crash is level 5 try to associate crash to level 5 polygon and return the location id
            IF (is_crash_level_5(crash_id, rpt_road_part_id, rpt_hwy_num)) THEN
                RETURN (
                    SELECT location_id 
                    FROM atd_txdot_locations 
                    WHERE location_group = 2 -- level 5 polygons
                    AND (geometry && location)
                    AND ST_Contains(geometry, location)
                    LIMIT 1
                );
            -- Return the location id of the crash by finding which location polygon the crash
            -- geographic position resides in
            ELSE
                RETURN (
                    SELECT location_id 
                    FROM atd_txdot_locations 
                    WHERE location_group = 1 -- level 1-4 polygons
                    AND (geometry && location)
                    AND ST_Contains(geometry, location)
                    LIMIT 1
                );
            END IF;
        END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_cr3_location_id IS 'This function is invoked by a stored generated column called location_id in the atd_txdot_crashes table. It is responsible for finding the location id of a crash.';
