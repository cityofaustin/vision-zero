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

        -- For records that have been manually matched we want to only update the matched_crash_pks column
        IF matching_ems.crash_match_status = 'matched_by_manual_qa' THEN
            UPDATE ems__incidents 
            SET matched_crash_pks = matched_crash_ids
            WHERE id = matching_ems.id;
        -- If the record has not been manually matched
        ELSE
          IF match_count = 0 THEN
              UPDATE ems__incidents 
              SET crash_pk = NULL,
                  crash_match_status = 'unmatched',
                  matched_crash_pks = NULL
              WHERE id = matching_ems.id;
          ELSIF match_count = 1 THEN
              -- this EMS record is only matched to one crash - we can assign the crash_pk and matched_crash_pks
              UPDATE ems__incidents 
              SET crash_pk = NEW.id,
                  crash_match_status = 'matched_by_automation',
                  matched_crash_pks = matched_crash_ids
              WHERE id = matching_ems.id;
          ELSE
              -- multiple matching crashes found - can assign the matched_crash_pks but not crash_pk
              UPDATE ems__incidents 
              SET crash_match_status = 'multiple_matches_by_automation',
                  crash_pk = NULL,
                  matched_crash_pks = matched_crash_ids
              WHERE id = matching_ems.id;
          END IF;
        END IF;
    END LOOP;

    IF TG_OP = 'UPDATE' THEN
        --
        -- Check if there are any EMS records that reference this crash
        --
        SELECT COUNT(*) INTO ems_cleanup_count
        FROM ems__incidents 
        WHERE NEW.id = ANY(matched_crash_pks);

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
                --
                -- Update the EMS records based on remaining match count
                --
                IF ems_record.crash_match_status = 'matched_by_manual_qa' THEN
                    -- For manually matched records, only update the crash ID array
                    raise debug 'Updating matched_crash_pks for manually matched EMS incident # %, ID % to %', ems_record.incident_number, ems_record.id, NULLIF(updated_matched_crash_ids, '{}');
                    UPDATE ems__incidents
                    SET matched_crash_pks = NULLIF(updated_matched_crash_ids, '{}')
                    WHERE id = ems_record.id;
                ELSIF remaining_crash_ids_count = 0 THEN
                    -- No other crashes matched to this EMS record
                    raise debug 'Updating EMS incident # %, ID % as `unmatched`', ems_record.incident_number, ems_record.id;
                    UPDATE ems__incidents 
                    SET crash_pk = NULL,
                        crash_match_status = 'unmatched',
                        matched_crash_pks = NULL
                    WHERE id = ems_record.id;
                ELSIF remaining_crash_ids_count = 1 THEN
                    -- One crash remaining: match it to the EMS record
                    raise debug 'Matching EMS incident # %, ID % to crash ID %', ems_record.incident_number, ems_record.id, updated_matched_crash_ids[1];
                    UPDATE ems__incidents 
                    SET crash_pk = updated_matched_crash_ids[1],
                        crash_match_status = 'matched_by_automation',
                        matched_crash_pks = updated_matched_crash_ids
                    WHERE id = ems_record.id;
                ELSE
                    -- Multiple crashes matches remaining
                    raise debug 'Updating matched_crash_pks for EMS incident # %, ID % which still has multiple matches', ems_record.incident_number, ems_record.id;
                    UPDATE ems__incidents 
                    SET crash_pk = NULL,
                        crash_match_status = 'multiple_matches_by_automation',
                        matched_crash_pks = updated_matched_crash_ids
                    WHERE id = ems_record.id;
                END IF;
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
