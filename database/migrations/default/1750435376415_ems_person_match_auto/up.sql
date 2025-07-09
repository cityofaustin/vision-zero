--
-- add person_match_status column
--
ALTER TABLE ems__incidents
ADD COLUMN person_match_status text DEFAULT 'unmatched' CHECK (
    person_match_status IN (
        'unmatched',
        'unmatched_by_manual_qa',
        'matched_by_automation',
        'matched_by_manual_qa',
        'multiple_matches_by_automation'
    )
),
ADD COLUMN matched_person_ids integer [],
ADD COLUMN _match_event_name text
-- add constraint to ensure event name is always reset to null
CHECK (_match_event_name IS NULL),
-- add constraint to ensure that crash_pk is never null if person_id is not null
ADD CONSTRAINT check_person_id_crash_pk_dependency CHECK (
    person_id IS NULL
    OR crash_pk IS NOT NULL
);

COMMENT ON COLUMN ems__incidents.person_match_status IS 'The status of the CR3 person record match';

COMMENT ON COLUMN ems__incidents.matched_person_ids IS 'The IDs of the CR3 person records that were found to match this record';

COMMENT ON COLUMN ems__incidents._match_event_name IS 'Used to dispatch crash matching events. Once dispatched, this value is always set to null via trigger';

--
-- Function which returns an array of person IDs that match an EMS patient care record
--
CREATE
OR REPLACE FUNCTION public.find_matching_person_ids(
    ems_record ems__incidents
) RETURNS integer [] AS $$
DECLARE
    matching_person_ids INTEGER[];
    other_matching_ems_id INTEGER;
BEGIN
    raise debug '**function: find_matching_person_ids**';
    --
    -- only query for matches when crash_pk is not null, ie the EMS record is already matched to a crash
    --
    if ems_record.crash_pk is null then
        return null;
    end if;
    --
    -- Check to see if there are other EMS patients with the same demographics
    -- todo: index these columns?
    --
    select id from ems__incidents e where
    e.incident_number = ems_record.incident_number
    and e.id !=  ems_record.id
    and e.pcr_patient_age = ems_record.pcr_patient_age
    and e.pcr_patient_race = ems_record.pcr_patient_race
    and e.pcr_patient_gender = ems_record.pcr_patient_gender
    limit 1
    into other_matching_ems_id;
    --
    -- Do not proceed if multiple identical PCRs 
    --
    IF other_matching_ems_id IS NOT NULL THEN
        raise debug 'Multiple EMS patients with same demographic characteristcs found - aborting person match.';
        return NULL;
    END IF;
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
        p.crash_pk = ems_record.crash_pk
        and p.prsn_age = ems_record.pcr_patient_age
        AND gndr_lkp.label ilike ems_record.pcr_patient_gender
        AND ems_record.pcr_patient_race ilike CONCAT('%', ethncty_lkp.label, '%')
        into matching_person_ids;

    raise debug 'Found % matching people records', array_length(matching_person_ids, 1);
    return NULLIF(matching_person_ids, '{}');
END;
$$ LANGUAGE plpgsql;

--
-- Add person_match_status to this trigger
--
CREATE
OR REPLACE FUNCTION public.ems_update_handle_record_match_event() RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE
    matching_person_ids INTEGER[];
    matching_person_record RECORD;
BEGIN
    raise debug '**function: ems_update_handle_record_match_event for EMS ID: % **, event: %', NEW.id, NEW._match_event_name;
    --
    -- Only continue if a valid _match_event_name is provided
    --
     IF NEW._match_event_name is null then
        return new;
    ELSIF NEW._match_event_name not in (
        'match_crash_by_automation',
        'match_person_by_manual_qa',
        'reset_crash_match',
        'sync_crash_pk_on_person_match',
        'unmatch_by_manual_qa',
        'update_matched_crash_ids'
    ) then
        RAISE EXCEPTION 'Invalid _match_event_name: `%`', NEW._match_event_name
        USING HINT = 'Check this function definition for allowed _match_event_name values',
            -- code 23514 is check_violation
            ERRCODE = '23514';
    END IF;
    --
    --  `unmatch_by_manual_qa` event is via VZE UI action
    --
    IF NEW._match_event_name = 'unmatch_by_manual_qa' then
        NEW.crash_match_status = 'unmatched_by_manual_qa'; 
        NEW.crash_pk = NULL;
        NEW.person_match_status = 'unmatched_by_manual_qa';
        NEW.matched_person_ids = NULL;
        NEW.person_id = NULL;
        NEW._match_event_name = null;
        return NEW;
    END IF;
    --
    -- `match_person_by_manual_qa` is sent when a person match is selected through the VZE UI
    --
    IF NEW._match_event_name = 'match_person_by_manual_qa' and NEW.person_id is not null then
        -- 
        -- Keep the record's crash_pk in sync with the provided person_id
        --
        SELECT id, crash_pk INTO matching_person_record 
        FROM people_list_view 
        WHERE id = NEW.person_id;

        IF matching_person_record.crash_pk IS DISTINCT FROM NEW.crash_pk then
            raise debug 'updating EMS record ID % crash_pk to % to match updated person_id', NEW.id, matching_person_record.crash_pk;
            NEW.crash_pk = matching_person_record.crash_pk;
            NEW.crash_match_status = 'matched_by_manual_qa';
            NEW.person_match_status = 'matched_by_manual_qa';
        END IF;
        -- clear the _match_event_name
        NEW._match_event_name = null;
        return new;
    END IF;
    --
    -- The update_matched_crash_ids event is set via the EMS-crash matching trigger
    --
    IF NEW._match_event_name = 'update_matched_crash_ids' then
        IF NEW.crash_match_status = 'matched_by_manual_qa'
        OR NEW.person_match_status = 'matched_by_manual_qa'then
            -- nothing at all todo here
            -- person match is not affected by this change
            -- because crash_pk is not changing
            raise debug 'update_matched_crash_ids: nothing to do to EMS ID % because crash/person have been matched manually', NEW.id;
            NEW._match_event_name = NULL;
            return NEW;
        ELSE
            -- if crash/person have not been matched manually, we can handle the updated
            -- matched_crash_ids array as if we are resetting the match
            raise debug 'update_matched_crash_ids: change event name to `reset_crash_match` fo EMS ID %', NEW.id;
            NEW._match_event_name = 'reset_crash_match';
        END IF;
    END IF;
    --
    -- reset_crash_match can be sent from the VZE UI or via previous step in this function
    --
    IF NEW._match_event_name = 'reset_crash_match' then
        --
        --  If there are no matched crash IDs
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
        --  If there is one matching crash ID
        --
        ELSIF array_length(NEW.matched_crash_pks, 1) = 1 THEN
            raise debug 'Reset EMS ID % crash_match_status to matched_by_automation', NEW.id;
            NEW.crash_pk = NEW.matched_crash_pks[1];
            NEW.crash_match_status = 'matched_by_automation';
            -- don't return here so that we proceed to person matching
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
    
    --
    -- Begin automated person-level matching
    --
    IF NEW._match_event_name in (
        'match_crash_by_automation',
        'sync_crash_pk_on_person_match',
        'reset_crash_match'
    )
        AND new.crash_pk IS NOT NULL THEN
        --
        -- reset _match_event_name in outermost block to avoid repetition
        --
        NEW._match_event_name = null;

        raise debug 'Doing person matching for EMS record ID % matched to crash %', NEW.id, NEW.crash_pk;

        if NEW.person_match_status = 'matched_by_manual_qa' 
            or NEW.pcr_patient_age is NULL
            or NEW.pcr_patient_gender is NULL
            or NEW.pcr_patient_race is NULL
            THEN
                -- ignore this update / nothing to do
                raise debug 'Skipping person matching for EMS ID %', NEW.id;
                return new;
        ELSE
            matching_person_ids = find_matching_person_ids(NEW);

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
    -- todo: do we need this line?
    NEW._match_event_name = null;
    return NEW;
END;
$function$;

DROP TRIGGER IF EXISTS ems_update_handle_match_trigger ON ems__incidents;
DROP TRIGGER IF EXISTS ems_update_handle_record_match_event_trigger ON ems__incidents;

CREATE TRIGGER ems_update_handle_record_match_event_trigger BEFORE
UPDATE ON ems__incidents FOR EACH ROW
EXECUTE FUNCTION ems_update_handle_record_match_event();

-- delete trigger which is now redundant
DROP TRIGGER IF EXISTS ems_update_person_crash_id_trigger ON ems__incidents;
DROP FUNCTION IF EXISTS ems_update_person_crash_id;

--
-- This function runs **after** updates to the EMS record and should be triggered when
-- NEW.crash_pk is distinct from OLD.crash_pk and person_id is not null
--
CREATE
OR REPLACE FUNCTION public.ems_update_incident_crash_pk() RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
    raise debug '**function: ems_update_incident_crash_pk **';
    IF NEW.person_id is null
        THEN
        raise debug 'person_id is null - nothing todo for EMS ID %', NEW.id;
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
-- add match events the ems-crash matching trigger
--
CREATE
OR REPLACE FUNCTION public.update_crash_ems_match() RETURNS trigger LANGUAGE plpgsql AS $function$
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

          UPDATE ems__incidents 
            SET 
                matched_crash_pks = matched_crash_ids,
                _match_event_name = 'update_matched_crash_ids'
            WHERE id = matching_ems.id;
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

                IF updated_matched_crash_ids = '{}' then
                    UPDATE ems__incidents
                    SET
                        matched_crash_pks = NULL,
                        _match_event_name = 'update_matched_crash_ids'
                    WHERE id = ems_record.id;
                ELSE
                    UPDATE ems__incidents
                    SET
                        matched_crash_pks = updated_matched_crash_ids,
                        _match_event_name = 'update_matched_crash_ids'
                    WHERE id = ems_record.id;
                END IF;
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;
