--
-- Adds a non_cr3_match_status column to ems__incidents and sets it via trigger
--
alter table ems__incidents
add column non_cr3_match_status text not null default 'unmatched',
add column matched_non_cr3_case_ids integer [],
add constraint ems__incidents_non_cr3_match_status_check
check (
    non_cr3_match_status in (
        'unmatched',
        'matched_by_automation',
        'multiple_matches_by_automation',
        'matched_by_manual_qa',
        'unmatched_by_manual_qa'
    )
);

comment on column ems__incidents.non_cr3_match_status is 'The status of the non-CR3 crash record match';
comment on column ems__incidents.matched_non_cr3_case_ids is 'The IDs of non-CR3 crases that were found to match this record. Set via trigger, always kept up to date regardless of EMS match status.';

create index ems__incidents_non_cr3_match_status_index on public.ems__incidents (
    non_cr3_match_status
);

create or replace function public.update_noncr3_ems_match()
returns trigger
language plpgsql
as $function$
DECLARE
    matching_ems RECORD;
    ems_record RECORD;
    non_cr3_match_count INTEGER;
    matched_case_ids INTEGER[];
    meters_threshold INTEGER := 600;
    -- 30 min threshold equates to a 60 minute window (+/- 30 minutes of crash timestamp)
    time_threshold INTERVAL := '30 minutes';
    updated_matched_case_ids INTEGER[];
    remaining_case_ids_count INTEGER;
    ems_cleanup_count INTEGER;
BEGIN
    raise debug 'Triggered by % of non-cr3 case ID %', TG_OP,  NEW.case_id;
    --
    -- Find all EMS records near the non-cr3 location + time
    --
    FOR matching_ems IN (
        SELECT 
            e.id,
            e.incident_number,
            e.incident_received_datetime,
            e.geometry,
            e.non_cr3_match_status
        FROM 
            ems__incidents e
        WHERE
            e.incident_received_datetime  >= (NEW.case_timestamp - time_threshold)
            AND e.incident_received_datetime  <= (NEW.case_timestamp + time_threshold)
            AND e.geometry IS NOT NULL
            AND NEW.position IS NOT NULL
            AND ST_DWithin(e.geometry::geography, NEW.position::geography, meters_threshold)
    ) LOOP
        raise debug 'Handling EMS incident # %, ID %', matching_ems.incident_number, matching_ems.id;
        --
        -- For each EMS record, find all non-cr3 crashes which match based on the location + time threshold
        --
        SELECT 
            COALESCE(array_agg(c.case_id), ARRAY[]::integer[])
        FROM atd_apd_blueform c
        WHERE 
            c.case_timestamp BETWEEN 
                (matching_ems.incident_received_datetime - time_threshold) AND 
                (matching_ems.incident_received_datetime + time_threshold)
            AND c.is_deleted = false
            AND c.position IS NOT NULL
            AND ST_DWithin(c.position::geography, matching_ems.geometry::geography, meters_threshold)
        INTO matched_case_ids;
            
        --
        -- Get the count of matching non-cr3s (handling null as 0)
        --
        SELECT COALESCE(array_length(matched_case_ids, 1), 0) INTO non_cr3_match_count;

        raise debug 'Found %  matching non-cr3s', non_cr3_match_count;

        --
        -- Update EMS records based on match results
        --
        IF matching_ems.non_cr3_match_status = 'matched_by_manual_qa' THEN
            -- Record has been manually matched: only update the matched_non_cr3_case_ids column
            raise debug 'Updating `matched_non_cr3_case_ids` for manually matched EMS record';
            UPDATE ems__incidents 
            SET matched_non_cr3_case_ids = NULLIF(matched_case_ids, '{}')
            WHERE id = matching_ems.id;
        ELSE
          IF non_cr3_match_count = 0 THEN
              -- No matches found
              raise debug 'Updating EMS record as `unmatched`';
              UPDATE ems__incidents 
              SET atd_apd_blueform_case_id = NULL,
                  non_cr3_match_status = 'unmatched',
                  matched_non_cr3_case_ids = NULL
              WHERE id = matching_ems.id;
          ELSIF non_cr3_match_count = 1 THEN
              -- One match found: assign the atd_apd_blueform_case_id and matched_non_cr3_case_ids
              raise debug 'Matching EMS record to non-cr3 case ID %',  matched_case_ids[1];
              UPDATE ems__incidents 
              SET atd_apd_blueform_case_id = matched_case_ids[1],
                  non_cr3_match_status = 'matched_by_automation',
                  matched_non_cr3_case_ids = matched_case_ids
              WHERE id = matching_ems.id;
          ELSE
              -- Multiple matching non-cr3s found: assign the matched_non_cr3_case_ids but not atd_apd_blueform_case_id
              raise debug 'Multiple non-cr3 case IDs found: %',  matched_case_ids;
              UPDATE ems__incidents 
              SET non_cr3_match_status = 'multiple_matches_by_automation',
                  atd_apd_blueform_case_id = NULL,
                  matched_non_cr3_case_ids = matched_case_ids
              WHERE id = matching_ems.id;
          END IF;
        END IF;
    END LOOP;

    --
    -- Additional handling when a non-cr3 has been updated
    --
    IF TG_OP = 'UPDATE' THEN
        --
        -- Check if there are any EMS records that reference this non-cr3
        --
        SELECT COUNT(*) INTO ems_cleanup_count
        FROM ems__incidents 
        WHERE NEW.case_id = ANY(matched_non_cr3_case_ids);
        
        raise debug '% EMS records need to be checked for possible update', ems_cleanup_count;

        IF ems_cleanup_count > 0 THEN
            --
            -- Check for EMS records that were previously matched to this case but should no longer be
            --
            FOR ems_record IN (
                SELECT 
                    id, 
                    incident_number,
                    matched_non_cr3_case_ids, 
                    non_cr3_match_status,
                    atd_apd_blueform_case_id,
                    incident_received_datetime,
                    geometry
                FROM ems__incidents
                WHERE NEW.case_id = ANY(matched_non_cr3_case_ids)
                    --
                    -- If the incident matches any of these conditions, it should NOT be matched
                    -- to this non-cr3
                    --
                    AND (
                        incident_received_datetime < (NEW.case_timestamp - time_threshold)
                        OR incident_received_datetime > (NEW.case_timestamp + time_threshold)
                        OR geometry IS NULL
                        OR NEW.position IS NULL
                        OR NEW.is_deleted IS TRUE
                        OR (NOT ST_DWithin(geometry::geography, NEW.position::geography, meters_threshold))
                    )
            )
            LOOP
                raise debug 'Handling cleanup for EMS incident # %, ID %', ems_record.incident_number, ems_record.id;

                -- Remove the this non-cr3's case_id from the EMS record's matched_non_cr3_case_ids
                SELECT array_remove(ems_record.matched_non_cr3_case_ids, NEW.case_id) INTO updated_matched_case_ids;
                SELECT COALESCE(array_length(updated_matched_case_ids, 1), 0) INTO remaining_case_ids_count;

                raise debug 'remaining_case_ids_count: %', remaining_case_ids_count;
                raise debug 'updated_matched_case_ids: %', updated_matched_case_ids;
                --
                -- Update the EMS records based on remaining match count
                --
                IF ems_record.non_cr3_match_status = 'matched_by_manual_qa' THEN
                    -- For manually matched records, only update the case_id array
                    raise debug 'Updating matched_non_cr3_case_ids for manually matched EMS incident # %, ID % to %', ems_record.incident_number, ems_record.id, NULLIF(updated_matched_case_ids, '{}');
                    UPDATE ems__incidents
                    SET matched_non_cr3_case_ids = NULLIF(updated_matched_case_ids, '{}')
                    WHERE id = ems_record.id;
                ELSIF remaining_case_ids_count = 0 THEN
                    -- No other non-cr3s matched to this EMS record
                    raise debug 'Updating EMS incident # %, ID % as `umatched`', ems_record.incident_number, ems_record.id;
                    UPDATE ems__incidents 
                    SET atd_apd_blueform_case_id = NULL,
                        non_cr3_match_status = 'unmatched',
                        matched_non_cr3_case_ids = NULL
                    WHERE id = ems_record.id;
                ELSIF remaining_case_ids_count = 1 THEN
                    -- One non-cr3 remaining: match it to the EMS record
                    raise debug 'Matching EMS incident # %, ID % to non-cr3 case ID %', ems_record.incident_number, ems_record.id, updated_matched_case_ids[1];
                    UPDATE ems__incidents 
                    SET atd_apd_blueform_case_id = updated_matched_case_ids[1],
                        non_cr3_match_status = 'matched_by_automation',
                        matched_non_cr3_case_ids = updated_matched_case_ids
                    WHERE id = ems_record.id;
                ELSE
                    -- Multiple non-cr3 matches remaining
                    raise debug 'Updating matched_non_cr3_case_ids for EMS incident # %, ID % which still has multiple matches', ems_record.incident_number, ems_record.id;
                    UPDATE ems__incidents 
                    SET atd_apd_blueform_case_id = NULL,
                        non_cr3_match_status = 'multiple_matches_by_automation',
                        matched_non_cr3_case_ids = updated_matched_case_ids
                    WHERE id = ems_record.id;
                END IF;
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

comment on function public.update_noncr3_ems_match is 'Trigger function which assigns non-CR3 case IDs to EMS incidents and updates the match status';

--
-- create insert trigger
--
create or replace trigger non_cr3_insert_ems_match_trigger
after insert on atd_apd_blueform
for each row execute function update_noncr3_ems_match();

--
-- create update trigger
--
create or replace trigger non_cr3_update_ems_match_trigger
after update on atd_apd_blueform
for each row when (
    (new.latitude is distinct from old.latitude)
    or (new.longitude is distinct from old.longitude)
    or (new.case_timestamp is distinct from old.case_timestamp)
    or (new.is_deleted is distinct from old.is_deleted)
) execute function update_noncr3_ems_match();
