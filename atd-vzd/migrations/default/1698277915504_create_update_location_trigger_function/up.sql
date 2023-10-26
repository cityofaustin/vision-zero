-- This trigger function updates the location_id of a record in atd_txdot_crashes on insert or update.
CREATE OR REPLACE FUNCTION public.update_cr3_location()
    RETURNS TRIGGER AS $$
        BEGIN
            -- If crash is level 5 try to associate crash to level 5 polygon and return the location id
            IF (NEW.rpt_road_part_id != 2 AND UPPER(LTRIM(NEW.rpt_hwy_num)) IN ('35', '183','183A','1','290','71','360','620','45','130')) THEN
                NEW.location_id = (
                    SELECT location_id 
                    FROM public.atd_txdot_locations 
                    WHERE location_group = 2 -- level 5 polygons
                    AND (geometry && ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326))
                    AND ST_Contains(geometry, ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326))
                    LIMIT 1 --TODO: This should be temporary until we get our polygons in order and there are no overlaps
                );
            -- Return the location id of the crash by finding which location polygon the crash
            -- geographic position resides in
            ELSE
                NEW.location_id = (
                    SELECT location_id 
                    FROM public.atd_txdot_locations 
                    WHERE location_group = 1 -- level 1-4 polygons
                    AND (geometry && ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326))
                    AND ST_Contains(geometry, ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326))
                    LIMIT 1 --TODO: This should be temporary until we get our polygons in order
                );
            END IF;
            RETURN NEW;
        END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_cr3_location IS 'This trigger function is used to update the location_id on insert and update of a record in atd_txdot_crashes in the vz_facts or cris_facts schemas.';
