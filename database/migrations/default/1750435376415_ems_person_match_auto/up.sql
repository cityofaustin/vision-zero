-- todo: update matching trigger

--
-- add person_match_status column
--
alter table ems__incidents
add column person_match_status text default 'unmatched'
check (
    person_match_status in (
        'unmatched',
        'unmatched_by_manual_qa',
        'matched_by_automation',
        'matched_by_manual_qa',
        'multiple_matches_by_automation'
    )
),
add column matched_person_ids integer [],
add column _match_event_name text
check (
    _match_event_name is null
);

comment on column ems__incidents.person_match_status is 'The status of the CR3 person record match';
comment on column ems__incidents.matched_person_ids is 'The IDs of the CR3 person records that were found to match this record';
comment on column ems__incidents._match_event_name is 'The name of the matching event...';

--
-- Add person_match_status to this trigger
--
create or replace function public.ems_update_handle_record_match()
returns trigger
language plpgsql
as $function$
DECLARE
    matching_person_ids INTEGER[];
    matching_person_record RECORD;
    other_matching_ems_id INTEGER;
BEGIN
    raise debug '**function: ems_update_handle_person_match for EMS ID: % **, event: %', NEW.id, NEW._match_event_name;
    
    --
    -- Only continue if crash_pk or person_id has changed
    --
     IF NEW._match_event_name is null then
        return new;
    end if;

    --
    -- Expecting `match_person_by_manual_qa` to come from VZE when a person match
    -- is selected through the UI
    --
    IF NEW._match_event_name = 'match_person_by_manual_qa' and NEW.person_id is not null then
        -- 
        -- Make sure crash_pk aligns with provided person_id
        --
        SELECT id, crash_pk INTO matching_person_record 
        FROM people_list_view 
        WHERE id = NEW.person_id;

        IF matching_person_record.crash_pk IS DISTINCT FROM NEW.crash_pk then
            raise debug 'updating EMS record ID % crash_pk to % to match updated person_id', NEW.id, matching_person_record.crash_pk;
            NEW.crash_pk = matching_person_record.crash_pk;
            NEW.crash_match_status = 'matched_by_manual_qa';
            NEW.person_match_status = 'matched_by_manual_qa';
        end if;
        NEW._match_event_name = null;
        return new;
    end if;

    IF NEW._match_event_name = 'reset_crash_match' then
        --
        --  No matched crash IDs
        --
        IF array_length(NEW.matched_crash_pks, 1) IS NULL THEN
            -- reset to unmatched
            raise debug 'Reset EMS ID % crash_match_status to unmatched', NEW.id;
            NEW.crash_match_status = 'unmatched';
            NEW.crash_pk = NULL;
            NEW.person_match_status = 'unmatched';
            NEW.matched_person_ids = NULL;
            NEW.person_id = NULL;
            NEW._match_event_name = null;
            return NEW;
        --
        --  One matching crash ID
        --
        ELSIF array_length(NEW.matched_crash_pks, 1) = 1 THEN
            raise debug 'Reset EMS ID % crash_match_status to matched_by_automation', NEW.id;
            NEW.crash_pk = NEW.matched_crash_pks[1];
            NEW.crash_match_status = 'matched_by_automation';
            --
            -- todo reset person match status as well?
            -- Let person matching block handle person fields. todo: test
            --

            



            -- IF array_length(NEW.matched_person_ids, 1) IS NULL THEN
            --     -- no match
            --     raise debug 'Reset person match status to unmatched for EMS ID %', NEW.id;
            --     NEW.person_match_status = 'unmatched';
            --     NEW.person_id = NULL;
            -- ELSIF array_length(NEW.matched_person_ids, 1) = 1 THEN
            --     raise debug 'Reset person match for EMS ID % to %', NEW.id, NEW.matched_person_ids[1];
            --     NEW.person_id = NEW.matched_person_ids[1];
            --     NEW.person_match_status = 'matched_by_automation';
            -- ELSE
            --     raise debug 'Multiple person matches found for EMS ID %', NEW.id;
            --     NEW.person_match_status = 'multiple_matches_by_automation';
            --     NEW.person_id = NULL;
            -- END IF;

            -- notice how we don't return NEW here—proceed to person match
        ELSE
            raise debug 'Reset EMS ID % to multiple_matches_by_automation', NEW.id;
            NEW.crash_pk = null;
            NEW.crash_match_status = 'multiple_matches_by_automation';
            NEW.person_id = NULL;
            NEW.person_match_status = 'unmatched';
            NEW.matched_person_ids = NULL;
            NEW._match_event_name = null;
            return new;
        END IF;
    END IF;
    

    -- IF NEW._match_event_name = 'reset_person_match' then
    --     -- todo
    --     NEW._match_event_name = null;
    --     return new;
    -- END IF;


    IF NEW._match_event_name in (
        'match_crash_by_automation',
        'match_crash_by_manual_qa',
        'sync_crash_pk_on_person_match',
        'reset_crash_match'
    )
        AND new.crash_pk IS NOT NULL THEN
        
        -- reset _match_event_name in outermost block to avoid repetition
        NEW._match_event_name = null;

        raise debug 'EMS record ID % matched to crash %', NEW.id, NEW.crash_pk;

        -- todo: check if person_match status is matched_by_manual_qa before we continue?
        if NEW.person_match_status = 'matched_by_manual_qa' 
            or NEW.pcr_patient_age is NULL
            or NEW.pcr_patient_gender is NULL
            or NEW.pcr_patient_race is NULL
            THEN
                -- ignore this update / nothing to do
                raise debug 'Doing nothing for EMS ID %', NEW.id;
                return new;
        ELSE
            --
            --  Begin automated person matching
            --
            --
            -- Check to see if there are other EMS patients with the same demographics
            --
            -- todo: index these columns?
            --
            select id from ems__incidents e where
            e.incident_number = NEW.incident_number
            and e.id !=  NEW.id
            and e.pcr_patient_age = NEW.pcr_patient_age
            and e.pcr_patient_race = NEW.pcr_patient_race
            and e.pcr_patient_gender = NEW.pcr_patient_gender
            limit 1
            into other_matching_ems_id;

            --
            -- Do not proceed if multiple identical PCRs 
            -- todo: we could potentially try to match multiple records to multiple people?
            --
            IF other_matching_ems_id IS NOT NULL THEN
                raise debug 'Multiple EMS patients with same demographic characteristcs found - aborting person match.';
            ELSE
                --
                --  At this point, we have an EMS record:
                -- whose crash_pk has changed and is not nul
                -- person_match_status is not matched_by_manual_qa
                -- is a unique incident # + demographics 
                --
                -- Query for matching person records
                --
                SELECT
                    COALESCE(array_agg(p.id), ARRAY[]::integer[])
                FROM
                    people_list_view p
                    left join lookups.drvr_ethncty ethncty_lkp on ethncty_lkp.id = p.prsn_ethnicity_id
                    left join lookups.gndr gndr_lkp on gndr_lkp.id = p.prsn_gndr_id
                WHERE
                    p.crash_pk = NEW.crash_pk
                    and p.prsn_age = NEW.pcr_patient_age
                    AND gndr_lkp.label ilike NEW.pcr_patient_gender
                    AND NEW.pcr_patient_race ilike CONCAT('%', ethncty_lkp.label, '%')
                    into matching_person_ids;

                raise debug 'Found % matching people records', array_length(matching_person_ids, 1);

                IF array_length(matching_person_ids, 1) IS NULL THEN
                    -- no match
                    raise debug 'No person match found for EMS ID %', NEW.id;
                    NEW.person_match_status = 'unmatched';
                    NEW.matched_person_ids = NULL;
                    NEW.person_id = NULL;
                    return NEW;
                ELSIF array_length(matching_person_ids, 1) = 1 THEN
                    raise debug 'One person match found for EMS ID %', NEW.id;
                    NEW.matched_person_ids = matching_person_ids;
                    NEW.person_id = matching_person_ids[1];
                    NEW.person_match_status = 'matched_by_automation';
                    return NEW;
                ELSE
                    raise debug 'Multiple person matches found for EMS ID %', NEW.id;
                    NEW.matched_person_ids = matching_person_ids;
                    NEW.person_match_status = 'multiple_matches_by_automation';
                    NEW.person_id = NULL;
                    return NEW;
                END IF;
            END IF;
        END IF;
    END IF;
    NEW._match_event_name = null;
    return NEW;
END;
$function$;


drop trigger if exists ems_update_handle_record_match on ems__incidents;

create trigger ems_update_handle_match_trigger before update on ems__incidents
for each row execute function ems_update_handle_record_match();

-- delete trigger which is now redundant
drop trigger if exists ems_update_person_crash_id_trigger on ems__incidents;
drop function if exists ems_update_person_crash_id;


--
-- This function runs **after** updates to the EMS record
--
create or replace function public.ems_update_incident_crash_pk()
returns trigger
language plpgsql
as $function$
BEGIN
    raise debug '**function: ems_update_incident_crash_pk **';
    IF NEW.person_id is null
        THEN
        raise debug 'person_id is null. aborting for EMS ID %', NEW.id;
        return null;
    END IF;
    -- Update crash_pk of related EMS if not already matched to a person
    raise debug 'updating crash_pk and crash_match_status of related EMS records to matched by manual/qa for incident # %', NEW.incident_number;
    UPDATE ems__incidents 
    SET 
        crash_pk = NEW.crash_pk,
        updated_by = NEW.updated_by,
        crash_match_status = NEW.crash_match_status,
        _match_event_name = 'sync_crash_pk_on_person_match'
    WHERE
        id != NEW.id
        AND incident_number = NEW.incident_number
        AND crash_pk is distinct from NEW.crash_pk
        AND person_id IS NULL;
    RETURN null;
END;
$function$;




--
-- add person match and match event to the matching trigger
--
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
                  matched_crash_pks = NULL,
                  _match_event_name = 'reset_crash_match'
                  --todo: obvi test this
              WHERE id = matching_ems.id;
          ELSIF match_count = 1 THEN
              -- this EMS record is only matched to one crash - we can assign the crash_pk and matched_crash_pks
              UPDATE ems__incidents 
              SET crash_pk = NEW.id,
                  crash_match_status = 'matched_by_automation',
                  matched_crash_pks = matched_crash_ids,
                  _match_event_name = 'match_crash_by_automation'
              WHERE id = matching_ems.id;
          ELSE
              -- multiple matching crashes found - can assign the matched_crash_pks but not crash_pk
              UPDATE ems__incidents 
              SET
                  crash_pk = NULL,
                  matched_crash_pks = matched_crash_ids,
                  _match_event_name = 'reset_crash_match'
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
                    if updated_matched_crash_ids = '{}' then
                        UPDATE ems__incidents
                        SET
                            matched_crash_pks = NULL,
                            matched_person_ids = NULL
                            -- todo: ????? how to retrigger persion matching if crash changes to matched_by_automatiON?
                        WHERE id = ems_record.id;
                    ELSE
                        -- todo
                    END IF;
                ELSIF remaining_crash_ids_count = 0 THEN
                    -- No other crashes matched to this EMS record
                    raise debug 'Updating EMS incident # %, ID % as `unmatched`', ems_record.incident_number, ems_record.id;
                    UPDATE ems__incidents 
                    SET crash_pk = NULL,
                        matched_crash_pks = NULL,
                        _match_event_name = 'reset_crash_match'
                        -- todo: test obvi
                    WHERE id = ems_record.id;
                ELSIF remaining_crash_ids_count = 1 THEN
                    -- One crash remaining: match it to the EMS record
                    raise debug 'Matching EMS incident # %, ID % to crash ID %', ems_record.incident_number, ems_record.id, updated_matched_crash_ids[1];
                    UPDATE ems__incidents 
                    SET crash_pk = updated_matched_crash_ids[1],
                        matched_crash_pks = updated_matched_crash_ids,
                        _match_event_name = 'reset_crash_match'
                        -- todo make sure this triggers person match?? and can we not use `crash_match_status` and let trigger handle?
                    WHERE id = ems_record.id;
                ELSE
                    -- Multiple crashes matches remaining
                    raise debug 'Updating matched_crash_pks for EMS incident # %, ID % which still has multiple matches', ems_record.incident_number, ems_record.id;
                    UPDATE ems__incidents 
                    SET crash_pk = NULL,
                        matched_crash_pks = updated_matched_crash_ids,
                        _match_event_name = 'reset_crash_match'
                    WHERE id = ems_record.id;
                END IF;
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
