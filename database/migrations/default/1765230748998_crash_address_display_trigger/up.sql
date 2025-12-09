ALTER TABLE crashes ADD COLUMN address_display TEXT;

-- Create an index on the new column
CREATE INDEX idx_crashes_address_display ON crashes(address_display);

-- Function to format highway addresses
CREATE OR REPLACE FUNCTION format_highway_address(
    at_intrsct_fl BOOLEAN,
    block_num TEXT,
    street_pfx TEXT,
    rwy_sys_label TEXT,
    hwy_num TEXT,
    road_part_label TEXT
) RETURNS TEXT AS $$
DECLARE
    formatted_address TEXT := '';
    rwy_sys_short TEXT;
BEGIN
    -- Add block number only if not at intersection
    IF NOT at_intrsct_fl AND block_num IS NOT NULL AND block_num != '' THEN
        formatted_address := formatted_address || block_num || ' ';
    END IF;
    
    -- Add street prefix if provided and not empty
    IF street_pfx IS NOT NULL AND street_pfx != '' THEN
        formatted_address := formatted_address || street_pfx || ' ';
    END IF;
    
    -- Convert roadway system label to shorthand
    IF rwy_sys_label IS NOT NULL THEN
        rwy_sys_short := CASE UPPER(rwy_sys_label)
            WHEN 'US HIGHWAY' THEN 'US'
            WHEN 'STATE LOOP' THEN 'LOOP'
            WHEN 'INTERSTATE' THEN 'IH'
            WHEN 'FARM TO MARKET' THEN 'FM'
            WHEN 'RANCH ROAD' THEN 'RR'
            WHEN 'RANCH TO MARKET' THEN 'RM'
            ELSE UPPER(rwy_sys_label)
        END;
        
        formatted_address := formatted_address || rwy_sys_short || ' ';
    END IF;
    
    -- Add highway number if provided and not empty
    IF hwy_num IS NOT NULL AND hwy_num != '' AND hwy_num != 'NOT REPORTED' THEN
        formatted_address := formatted_address || hwy_num || ' ';
    END IF;
    
    -- Add SVRD if road part is 2 (service road)
    IF road_part_label = 'SVRD' THEN
        formatted_address := formatted_address || 'SVRD ';
    END IF;
    
    -- Remove trailing spaces
    RETURN TRIM(formatted_address);
END;
$$ LANGUAGE plpgsql;

-- Function to format local street address
CREATE OR REPLACE FUNCTION format_street_address(
    at_intrsct_fl BOOLEAN,
    block_num TEXT,
    street_pfx TEXT,
    street_name TEXT,
    street_sfx TEXT
) RETURNS TEXT AS $$
DECLARE
    formatted_address TEXT := '';
BEGIN
    -- Add block number only if not at intersection
    IF NOT at_intrsct_fl AND block_num IS NOT NULL AND block_num != '' THEN
        formatted_address := formatted_address || block_num || ' ';
    END IF;
    
    -- Add street prefix if provided and not empty
    IF street_pfx IS NOT NULL AND street_pfx != '' THEN
        formatted_address := formatted_address || street_pfx || ' ';
    END IF;
    
    -- Add street name if provided and not empty
    IF street_name IS NOT NULL AND street_name != '' THEN
        formatted_address := formatted_address || street_name || ' ';
    END IF;
    
    -- Add street suffix if provided and not empty
    IF street_sfx IS NOT NULL AND street_sfx != '' THEN
        formatted_address := formatted_address || street_sfx || ' ';
    END IF;
    
    -- Remove trailing space
    RETURN TRIM(formatted_address);
END;
$$ LANGUAGE plpgsql;



-- Function to remove duplicate parts of address
CREATE OR REPLACE FUNCTION deduplicate_address_parts(address TEXT) RETURNS TEXT AS $$
DECLARE
    parts TEXT[];
    deduped_parts TEXT[] := '{}';
    i INT;
    current_part TEXT;
    prev_part TEXT;
    prev_upper TEXT;
BEGIN
    -- Split address by spaces
    parts := string_to_array(address, ' ');
    
    FOR i IN 1..array_length(parts, 1) LOOP
        current_part := parts[i];
        
    IF i = 1 THEN
            -- First word of address always included
            deduped_parts := array_append(deduped_parts, current_part);
        ELSE
            prev_part := parts[i-1];
            
            -- Only add if not a duplicate of previous (case-insensitive)
            IF UPPER(current_part) != UPPER(prev_part) THEN
                deduped_parts := array_append(deduped_parts, current_part);
            END IF;
        END IF;
    END LOOP;
    
    -- Reconstruct address
    RETURN array_to_string(deduped_parts, ' ');
END;
$$ LANGUAGE plpgsql;


-- Main function to generate complete crash address
CREATE OR REPLACE FUNCTION generate_crash_address(
    at_intrsct_fl BOOLEAN,
    -- Primary address parts
    rpt_block_num TEXT,
    rpt_street_pfx TEXT,
    rpt_street_name TEXT,
    rpt_street_sfx TEXT,
    rpt_hwy_num TEXT,
    rpt_hwy_sfx TEXT,
    rpt_rdwy_sys_id INTEGER,
    rpt_road_part_id INTEGER,
    -- Secondary address parts
    rpt_sec_block_num TEXT,
    rpt_sec_street_pfx TEXT,
    rpt_sec_street_name TEXT,
    rpt_sec_street_sfx TEXT,
    rpt_sec_hwy_num TEXT,
    rpt_sec_hwy_sfx TEXT,
    rpt_sec_rdwy_sys_id INTEGER,
    rpt_sec_road_part_id INTEGER
) RETURNS TEXT AS $$
DECLARE
    primary_address TEXT := '';
    secondary_address TEXT := '';
    rwy_sys_primary_label TEXT;
    rwy_sys_secondary_label TEXT;
    road_part_primary_label TEXT;
    road_part_secondary_label TEXT;
    formatted_address TEXT := '';
BEGIN
    -- Get lookup values
    SELECT label INTO rwy_sys_primary_label 
    FROM lookups.rwy_sys WHERE id = rpt_rdwy_sys_id;
    
    SELECT label INTO rwy_sys_secondary_label 
    FROM lookups.rwy_sys WHERE id = rpt_sec_rdwy_sys_id;
    
    SELECT label INTO road_part_primary_label 
    FROM lookups.road_part WHERE id = rpt_road_part_id;
    
    SELECT label INTO road_part_secondary_label 
    FROM lookups.road_part WHERE id = rpt_sec_road_part_id;
    

    -- FORMAT PRIMARY ADDRESS
    IF rpt_hwy_num IS NOT NULL AND rpt_hwy_num != '' AND rpt_hwy_num != 'NOT REPORTED' THEN
        -- Use highway formatting for primary
        primary_address := format_highway_address(
            at_intrsct_fl,
            rpt_block_num,
            rpt_street_pfx,
            rwy_sys_primary_label,
            rpt_hwy_num,
            road_part_primary_label
        );
    ELSIF rpt_street_name IS NOT NULL AND rpt_street_name != '' AND rpt_street_name != 'NOT REPORTED' THEN
        -- Use local street formatting for primary
        primary_address := format_street_address(
            at_intrsct_fl,
            rpt_block_num,
            rpt_street_pfx,
            rpt_street_name,
            rpt_street_sfx
        );
    END IF;
    
    -- FORMAT SECONDARY ADDRESS (only if at intersection)
    IF at_intrsct_fl = true THEN
        IF rpt_sec_hwy_num IS NOT NULL AND rpt_sec_hwy_num != '' AND rpt_sec_hwy_num != 'NOT REPORTED' THEN
            -- Use highway formatting for secondary
            secondary_address := format_highway_address(
                at_intrsct_fl,
                rpt_block_num,
                rpt_sec_street_pfx,
                rwy_sys_secondary_label,
                rpt_sec_hwy_num,
                road_part_secondary_label
            );
        ELSIF rpt_sec_street_name IS NOT NULL AND rpt_sec_street_name != '' AND rpt_sec_street_name != 'NOT REPORTED' THEN
            -- Use local street formatting for secondary
            secondary_address := format_street_address(
                at_intrsct_fl,
                rpt_block_num,
                rpt_sec_street_pfx,
                rpt_sec_street_name,
                rpt_sec_street_sfx
            );
        END IF;
    END IF;
    
    -- Build final address
    IF at_intrsct_fl = true THEN
        -- Intersection: join primary and secondary with ' & '
        IF primary_address != '' AND secondary_address != '' THEN
            formatted_address := primary_address || ' & ' || secondary_address;
        -- If either primary or secondary address is missing, just use the address that is available
        ELSIF primary_address != '' THEN
            formatted_address := primary_address;
        ELSIF secondary_address != '' THEN
            formatted_address := secondary_address;
        END IF;
    ELSE
        -- Not at intersection, only use primary address
        formatted_address := primary_address;
    END IF;
    
    -- Remove duplicate address parts
    IF formatted_address != '' THEN
        formatted_address := deduplicate_address_parts(formatted_address);
    END IF;
    
    RETURN formatted_address;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function
CREATE OR REPLACE FUNCTION update_crash_address_display()
RETURNS TRIGGER AS $$
BEGIN
    NEW.address_display := (
        SELECT generate_crash_address(
            NEW.at_intrsct_fl,
            NEW.rpt_block_num,
            NEW.rpt_street_pfx,
            NEW.rpt_street_name,
            NEW.rpt_street_sfx,
            NEW.rpt_hwy_num,
            NEW.rpt_hwy_sfx,
            NEW.rpt_rdwy_sys_id,
            NEW.rpt_road_part_id,
            NEW.rpt_sec_block_num,
            NEW.rpt_sec_street_pfx,
            NEW.rpt_sec_street_name,
            NEW.rpt_sec_street_sfx,
            NEW.rpt_sec_hwy_num,
            NEW.rpt_sec_hwy_sfx,
            NEW.rpt_sec_rdwy_sys_id,
            NEW.rpt_sec_road_part_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_crash_address_display
BEFORE INSERT OR UPDATE ON crashes
FOR EACH ROW
EXECUTE FUNCTION update_crash_address_display();

-- Drop old columns

ALTER TABLE crashes DROP COLUMN address_primary TEXT;

ALTER TABLE crashes ADD COLUMN address_secondary TEXT;