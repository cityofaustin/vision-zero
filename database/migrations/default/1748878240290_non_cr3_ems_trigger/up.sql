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
comment on column ems__incidents.matched_non_cr3_case_ids is 'The IDs of non-cr3 crases that were found to match this record. Set via trigger, always kept up to date regardless of EMS match status.';

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
    match_count INTEGER;
    matched_case_ids INTEGER[];
    meters_threshold INTEGER := 600;
    -- 30 min threshold equates to a 60 minute window (+/- 30 minutes of crash timestamp)
    time_threshold INTERVAL := '30 minutes';
    updated_matched_case_ids INTEGER[];
    remaining_case_ids_to_process_count INTEGER;
BEGIN
    -- Find all EMS records near the crash location + time
    FOR matching_ems IN (
        SELECT 
            e.id,
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
        -- Find all non-cr3 crashes which match this EMS record location + time
        SELECT 
            ARRAY(
                SELECT c.case_id
                FROM atd_apd_blueform c
                WHERE 
                    c.is_deleted = false
                    AND matching_ems.incident_received_datetime  >= (c.case_timestamp - time_threshold)
                    AND matching_ems.incident_received_datetime  <= (c.case_timestamp + time_threshold)
                    AND c.position IS NOT NULL
                    AND ST_DWithin(matching_ems.geometry::geography, c.position::geography, meters_threshold)
            ) INTO matched_case_ids;
            
        -- Get the count from the array length (handling when array_length is null as 0)
        SELECT COALESCE(array_length(matched_case_ids, 1), 0) INTO match_count;

        raise notice 'found match count: %', match_count;

        -- For records that have been manually matched we want to only update the matched_non_cr3_case_ids column
        IF matching_ems.non_cr3_match_status = 'matched_by_manual_qa' THEN
            UPDATE ems__incidents 
            SET matched_non_cr3_case_ids = matched_case_ids
            WHERE id = matching_ems.id;
        -- If the record has not been manually matched
        ELSE
          IF match_count = 0 THEN
              UPDATE ems__incidents 
              SET atd_apd_blueform_case_id = NULL,
                  non_cr3_match_status = 'unmatched',
                  matched_non_cr3_case_ids = NULL
              WHERE id = matching_ems.id;
          ELSIF match_count = 1 THEN
              raise notice 'Setting EMS ID `%` to matched_by_automation with case_id `%`', matching_ems.id, matched_case_ids[1];
              -- this EMS record is only matched to one crash - we can assign the atd_apd_blueform_case_id and matched_non_cr3_case_ids
              UPDATE ems__incidents 
              SET atd_apd_blueform_case_id = matched_case_ids[1],
                  non_cr3_match_status = 'matched_by_automation',
                  matched_non_cr3_case_ids = matched_case_ids
              WHERE id = matching_ems.id;
          ELSE
              -- multiple matching crashes found - can assign the matched_non_cr3_case_ids but not atd_apd_blueform_case_id
              raise notice 'Setting EMS ID `%` to multiple_matches_by_automation with case_ids `%`', matching_ems.id, matched_case_ids;
              UPDATE ems__incidents 
              SET non_cr3_match_status = 'multiple_matches_by_automation',
                  atd_apd_blueform_case_id = NULL,
                  matched_non_cr3_case_ids = matched_case_ids
              WHERE id = matching_ems.id;
          END IF;
        END IF;
    END LOOP;

    IF TG_OP = 'UPDATE' THEN
        -- Handle EMS incidents that were previously matched to this case but should no longer be
        FOR ems_record IN (
            SELECT 
                id, 
                matched_non_cr3_case_ids, 
                non_cr3_match_status,
                atd_apd_blueform_case_id
            FROM ems__incidents
            WHERE NEW.case_id = ANY(matched_non_cr3_case_ids)
              AND (
                  incident_received_datetime  < (NEW.case_timestamp - time_threshold)
                  OR incident_received_datetime  > (NEW.case_timestamp + time_threshold)
                  OR geometry IS NULL
                  OR NEW.position IS NULL
                  OR NEW.is_deleted IS TRUE
                  OR (NOT ST_DWithin(geometry::geography, NEW.position::geography, meters_threshold))
              )
        ) LOOP
            -- Remove the moved case_id from the matched_non_cr3_case_ids array
            SELECT array_remove(ems_record.matched_non_cr3_case_ids, NEW.case_id) INTO updated_matched_case_ids;
            SELECT COALESCE(array_length(updated_matched_case_ids, 1), 0) INTO remaining_case_ids_to_process_count;
            
            raise notice 'EMS ID `%` had case_id `%` removed, remaining matches: %', ems_record.id, NEW.case_id, remaining_case_ids_to_process_count;
            
            -- Update based on remaining match count
            IF ems_record.non_cr3_match_status = 'matched_by_manual_qa' THEN
                -- For manually matched records, only update the array
                UPDATE ems__incidents
                SET matched_non_cr3_case_ids = CASE 
                    WHEN remaining_case_ids_to_process_count > 0 THEN updated_matched_case_ids 
                    ELSE NULL 
                END
                WHERE id = ems_record.id;
            ELSIF remaining_case_ids_to_process_count = 0 THEN
                -- No matches remaining
                UPDATE ems__incidents 
                SET atd_apd_blueform_case_id = NULL,
                    non_cr3_match_status = 'unmatched',
                    matched_non_cr3_case_ids = NULL
                WHERE id = ems_record.id;
            ELSIF remaining_case_ids_to_process_count = 1 THEN
                -- One match remaining - set to single match
                UPDATE ems__incidents 
                SET atd_apd_blueform_case_id = updated_matched_case_ids[1],
                    non_cr3_match_status = 'matched_by_automation',
                    matched_non_cr3_case_ids = updated_matched_case_ids
                WHERE id = ems_record.id;
            ELSE
                -- Multiple matches remaining - keep as multiple matches
                UPDATE ems__incidents 
                SET atd_apd_blueform_case_id = NULL,
                    non_cr3_match_status = 'multiple_matches_by_automation',
                    matched_non_cr3_case_ids = updated_matched_case_ids
                WHERE id = ems_record.id;
            END IF;
        END LOOP;
       
        -- update the matched_non_cr3_case_ids column only for manually qa matches
        UPDATE ems__incidents
        SET matched_non_cr3_case_ids = NULL
        WHERE atd_apd_blueform_case_id = NEW.case_id
          AND (
              incident_received_datetime  < (NEW.case_timestamp - time_threshold)
              OR incident_received_datetime  > (NEW.case_timestamp + time_threshold)
              OR geometry IS NULL
              OR NEW.position IS NULL
              or NEW.is_deleted is TRUE
              OR (NOT ST_DWithin(geometry::geography, NEW.position::geography, meters_threshold))
          )
          AND 
            non_cr3_match_status = 'matched_by_manual_qa';
    END IF;
    RETURN NEW;
END;
$function$;

comment on function public.update_noncr3_ems_matchis 'Trigger function which assigns non-CR3 case IDs to EMS incidents and updates the match status';

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
