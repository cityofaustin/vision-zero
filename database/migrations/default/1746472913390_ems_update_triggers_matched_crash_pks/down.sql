CREATE OR REPLACE FUNCTION public.update_crash_ems_match()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    matching_ems RECORD;
    ems_record RECORD;
    match_count INTEGER;
    matched_crash_ids INTEGER[];
    meters_threshold INTEGER := 1200;
    -- 30 min threshold equates to a 60 minute window (+/- 30 minutes of crash timestamp)
    time_threshold INTERVAL := '30 minutes';
BEGIN
    -- Find all EMS records near the crash location + time
    FOR matching_ems IN (
        SELECT 
            e.id,
            e.incident_received_datetime,
            e.geometry
        FROM 
            ems__incidents e
        WHERE
            -- ignore manual qa matches: these should not be modified
            e.crash_match_status != 'matched_by_manual_qa'
            AND e.incident_received_datetime  >= (NEW.crash_timestamp - time_threshold)
            AND e.incident_received_datetime  <= (NEW.crash_timestamp + time_threshold)
            AND e.geometry IS NOT NULL
            AND NEW.position IS NOT NULL
            AND ST_DWithin(e.geometry::geography, NEW.position::geography, meters_threshold)
    ) LOOP
        -- Find all crashes which match this EMS record location + time
        SELECT 
            ARRAY(
                SELECT c.id
                FROM crashes c
                WHERE 
                    c.is_deleted = false
                    and not c.is_temp_record
                    AND matching_ems.incident_received_datetime  >= (c.crash_timestamp - time_threshold)
                    AND matching_ems.incident_received_datetime  <= (c.crash_timestamp + time_threshold)
                    AND c.position IS NOT NULL
                    AND ST_DWithin(matching_ems.geometry::geography, c.position::geography, meters_threshold)
            ) INTO matched_crash_ids;
            
        -- Get the count from the array length (handling when array_length is null as 0)
        SELECT COALESCE(array_length(matched_crash_ids, 1), 0) INTO match_count;
        
        IF match_count = 0 THEN
            UPDATE ems__incidents 
            SET crash_pk = NULL,
                crash_match_status = 'unmatched',
                matched_crash_pks = NULL
            WHERE id = matching_ems.id;
        ELSIF match_count = 1 THEN
            -- this EMS record is only matched to one crash - we can assign the crash_pk
            UPDATE ems__incidents 
            SET crash_pk = NEW.id,
                crash_match_status = 'matched_by_automation',
                matched_crash_pks = NULL
            WHERE id = matching_ems.id;
        ELSE
            -- multiple matching crashes found - cannot assign crash_pk
            UPDATE ems__incidents 
            SET crash_match_status = 'multiple_matches_by_automation',
                crash_pk = NULL,
                matched_crash_pks = matched_crash_ids
            WHERE id = matching_ems.id;
        END IF;
    END LOOP;

    --
    -- nullify the crash_pk for EMS records that no longer match this crash
    --
    IF TG_OP = 'UPDATE' THEN
        UPDATE ems__incidents
        SET crash_pk = NULL,
            crash_match_status = 'unmatched',
            matched_crash_pks = NULL
        WHERE crash_pk = NEW.id
          AND (
              incident_received_datetime  < (NEW.crash_timestamp - time_threshold)
              OR incident_received_datetime  > (NEW.crash_timestamp + time_threshold)
              OR geometry IS NULL
              OR NEW.position IS NULL
              OR NEW.is_temp_record is TRUE
              or NEW.is_deleted is TRUE
              OR (NOT ST_DWithin(geometry::geography, NEW.position::geography, meters_threshold))
          )
          AND 
            -- ignore manual qa matches: these should not be modified
            crash_match_status != 'matched_by_manual_qa';
    END IF;
    RETURN NEW;
END;
$function$;

UPDATE ems__incidents set matched_crash_pks = null where crash_match_status = 'matched_by_automation';

COMMENT ON COLUMN ems__incidents.matched_crash_pks IS 'The IDs of multiple crashes that were found to match this record. Set via trigger.';

COMMENT ON COLUMN ems__incidents.crash_pk IS 'Crash ID matched to this record';
