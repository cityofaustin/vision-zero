-- Function that checks if a new crash doesnt have lat/long, if so will try finding a matching CAD incident
-- to fill the lat/long with
CREATE OR REPLACE FUNCTION crashes_fill_cad_coordinates()
RETURNS TRIGGER AS $$
DECLARE
    v_lat numeric;
    v_lon numeric;
BEGIN
    -- Check if the crash meets the criteria
    IF (NEW.latitude IS NULL OR NEW.longitude IS NULL) 
       AND NEW.investigat_agency_id = 74 
       AND NEW.case_id IS NOT NULL THEN
        
        -- Search for matching CAD incident
        SELECT ci.latitude, ci.longitude
        INTO v_lat, v_lon
        FROM cad_incidents ci
        WHERE ci.agency_type_short = 'apd'
          AND ci.master_incident_number = NEW.case_id
          AND NEW.crash_timestamp BETWEEN ci.response_date - INTERVAL '2 days' 
                                      AND ci.response_date + INTERVAL '2 days'
        LIMIT 1;
        
        -- If a match is found, assign the values
        IF v_lat IS NOT NULL AND v_lon IS NOT NULL THEN
            NEW.latitude := v_lat;
            NEW.longitude := v_lon;
            NEW.geolocation_provider_id := 2; --"apd_cad"
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION crashes_fill_cad_coordinates IS 'This function checks if a new crash doesnt have a lat or long, 
if not it will try to find a matching CAD incident to fill the lat/long with';

-- This trigger must fire before any other trigger on the crashes table, so it must come first alphabetically
CREATE TRIGGER 00_crashes_fill_cad_coordinates_before_insert
BEFORE INSERT ON crashes
FOR EACH ROW
EXECUTE FUNCTION crashes_fill_cad_coordinates();
