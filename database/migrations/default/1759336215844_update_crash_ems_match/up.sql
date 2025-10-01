--- This migration updates the first query to not include EMS records that have been soft-deleted

CREATE OR REPLACE FUNCTION public.update_crash_ems_match()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    matching_ems RECORD;
    ems_record RECORD;
    ems_cleanup_count INTEGER;
    match_count INTEGER;
    matched_crash_ids INTEGER[];
    updated_matched_crash_ids INTEGER[];
    remaining_crash_ids_count INTEGER;
    meters_threshold INTEGER := 1200;
    -- 30 min threshold equates to a 60 minute window (+/- 30 minutes of crash timestamp)
    time_threshold INTERVAL := '30 minutes';
BEGIN
    -- Find all EMS records near the crash location + time
    FOR matching_ems IN (
        SELECT 
            e.id,
            e.incident_received_datetime,
            e.geometry,
            e.crash_match_status
        FROM 
            ems__incidents e
        WHERE
            e.incident_received_datetime  >= (NEW.crash_timestamp - time_threshold)
            AND e.is_deleted IS FALSE
            AND e.incident_received_datetime  <= (NEW.crash_timestamp + time_threshold)
            AND e.geometry IS NOT NULL
            AND NEW.position IS NOT NULL
            AND ST_DWithin(e.geometry::geography, NEW.position::geography, meters_threshold)
    ) LOOP
        -- Find all crashes which match this EMS record location + time
        SELECT 
        COALESCE(array_agg(c.id), ARRAY[]::integer[])
        FROM crashes c
        WHERE 
            c.is_deleted = false
            and not c.is_temp_record
            AND matching_ems.incident_received_datetime  >= (c.crash_timestamp - time_threshold)
            AND matching_ems.incident_received_datetime  <= (c.crash_timestamp + time_threshold)
            AND c.position IS NOT NULL
            AND ST_DWithin(matching_ems.geometry::geography, c.position::geography, meters_threshold)
        INTO matched_crash_ids;
            
        -- Get the count from the array length (handling when array_length is null as 0)
        SELECT COALESCE(array_length(matched_crash_ids, 1), 0) INTO match_count;

          UPDATE ems__incidents 
            SET 
                matched_crash_pks = matched_crash_ids,
                _match_event_name = 'handle_matched_crash_pks_updated'
            WHERE id = matching_ems.id;
    END LOOP;

    IF TG_OP = 'UPDATE' THEN
        --
        -- Check if there are any EMS records that reference this crash
        --
        SELECT COUNT(*) INTO ems_cleanup_count
        FROM ems__incidents 
        WHERE 
          NEW.id = ANY(matched_crash_pks)
          AND is_deleted IS FALSE;

        raise debug '% EMS records need to be checked for possible update', ems_cleanup_count;
        
        IF ems_cleanup_count > 0 THEN
            --
            -- Check for EMS records that were previously matched to this crash but should no longer be
            --
            FOR ems_record IN (
                SELECT 
                    id, 
                    incident_number,
                    matched_crash_pks, 
                    crash_match_status,
                    crash_pk,
                    incident_received_datetime,
                    geometry
                FROM ems__incidents
                WHERE NEW.id = ANY(matched_crash_pks)
                  AND is_deleted IS FALSE
                    --
                    -- If the incident matches any of these conditions, it should NOT be matched
                    -- to this crash
                    --
                    AND (
                        incident_received_datetime < (NEW.crash_timestamp - time_threshold)
                        OR incident_received_datetime > (NEW.crash_timestamp + time_threshold)
                        OR geometry IS NULL
                        OR NEW.position IS NULL
                        OR NEW.is_deleted IS TRUE
                        OR (NOT ST_DWithin(geometry::geography, NEW.position::geography, meters_threshold))
                    )
            )
            LOOP
                raise debug 'Handling cleanup for EMS incident # %, ID %', ems_record.incident_number, ems_record.id;

                -- Remove the this crash ID from the EMS record's matched_crash_pks
                SELECT array_remove(ems_record.matched_crash_pks, NEW.id) INTO updated_matched_crash_ids;
                SELECT COALESCE(array_length(updated_matched_crash_ids, 1), 0) INTO remaining_crash_ids_count;

                raise debug 'remaining_crash_ids_count: %', remaining_crash_ids_count;
                raise debug 'updated_matched_crash_ids: %', updated_matched_crash_ids;

                IF updated_matched_crash_ids = '{}' then
                    UPDATE ems__incidents
                    SET
                        matched_crash_pks = NULL,
                        _match_event_name = 'handle_matched_crash_pks_updated'
                    WHERE id = ems_record.id;
                ELSE
                    UPDATE ems__incidents
                    SET
                        matched_crash_pks = updated_matched_crash_ids,
                        _match_event_name = 'handle_matched_crash_pks_updated'
                    WHERE id = ems_record.id;
                END IF;
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;
