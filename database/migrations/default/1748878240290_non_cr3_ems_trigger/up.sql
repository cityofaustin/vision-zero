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
              -- this EMS record is only matched to one crash - we can assign the atd_apd_blueform_case_id and matched_non_cr3_case_ids
              UPDATE ems__incidents 
              SET atd_apd_blueform_case_id = NEW.case_id,
                  non_cr3_match_status = 'matched_by_automation',
                  matched_non_cr3_case_ids = matched_case_ids
              WHERE id = matching_ems.id;
          ELSE
              -- multiple matching crashes found - can assign the matched_non_cr3_case_ids but not atd_apd_blueform_case_id
              UPDATE ems__incidents 
              SET non_cr3_match_status = 'multiple_matches_by_automation',
                  atd_apd_blueform_case_id = NULL,
                  matched_non_cr3_case_ids = matched_case_ids
              WHERE id = matching_ems.id;
          END IF;
        END IF;
    END LOOP;

    IF TG_OP = 'UPDATE' THEN
        -- update incidents which have not been manually matched
        UPDATE ems__incidents
        SET atd_apd_blueform_case_id = NULL,
            non_cr3_match_status = 'unmatched',
            matched_non_cr3_case_ids = NULL
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
            -- ignore manual qa matches
            non_cr3_match_status != 'matched_by_manual_qa';
       
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
) execute function update_noncr3_ems_match();
