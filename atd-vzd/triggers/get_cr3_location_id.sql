-- This function is invoked by a stored generated column called location_id in the atd_txdot_crashes table.
-- It is responsible for finding the location id of a crash, setting the location_id to NULL if the crash occurred on a 
-- level 5 roadway and thus is outside of COA jurisdiction.
CREATE OR REPLACE FUNCTION get_cr3_location_id(location geometry(Geometry,4326), crash_id integer, rpt_road_part_id integer, rpt_hwy_num text) RETURNS text AS $$
        BEGIN
            -- If crash is level 5 return null because it is outside of COA jurisdiction
            IF (is_crash_level_5(crash_id, rpt_road_part_id, rpt_hwy_num)) THEN
                RETURN NULL;
            -- Return the location id of the crash by finding which location polygon the crash
            -- geographic position resides in
            ELSE
                RETURN (
                    SELECT location_id 
                    FROM atd_txdot_locations 
                    WHERE location_group = 1 
                    AND (geometry && location)
                    AND ST_Contains(geometry, location)
                );
            END IF;
        END;
$$ LANGUAGE plpgsql IMMUTABLE;
