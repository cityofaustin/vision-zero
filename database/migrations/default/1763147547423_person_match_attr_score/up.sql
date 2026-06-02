CREATE OR REPLACE FUNCTION public.ems_update_handle_record_match_event()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    matching_person_ids INTEGER[];
    matching_person_record_crash_pk INTEGER;
BEGIN
    raise debug '**function: ems_update_handle_record_match_event for EMS ID: % **, event: %', NEW.id, NEW._match_event_name;
    ---
    --- Make sure we aren't doing anything with soft deleted records
    ---
    IF NEW.is_deleted is false then
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
            'unmatch_crash_by_manual_qa',
            'unmatch_person_by_manual_qa',
            'handle_matched_crash_pks_updated',
            'handle_person_record_created_or_updated'
        ) then
            RAISE EXCEPTION 'Invalid _match_event_name: `%`', NEW._match_event_name
            USING HINT = 'Check this function definition for allowed _match_event_name values',
                -- code 23514 is check_violation
                ERRCODE = '23514';
        END IF;
        --
        -- `unmatch_crash_by_manual_qa` event is set from the VZE using the
        -- "Match not found" dropdown menu option
        --
        IF NEW._match_event_name = 'unmatch_crash_by_manual_qa' then
            NEW.crash_match_status = 'unmatched_by_manual_qa'; 
            NEW.crash_pk = NULL;
            NEW.person_match_status = 'unmatched_by_manual_qa';
            NEW.matched_person_ids = NULL;
            NEW.person_id = NULL;
            NEW._match_event_name = null;
            return NEW;
        END IF;
        --
        -- `unmatch_person_by_manual_qa` event is set from the VZE when
        -- the EMS record's person ID input is cleared
        --
        IF NEW._match_event_name = 'unmatch_person_by_manual_qa' then
            NEW.person_match_status = 'unmatched_by_manual_qa';
            NEW.person_id = NULL;
            NEW._match_event_name = null;
            return NEW;
        END IF;
        --
        -- `match_person_by_manual_qa` is set when a person match is selected through the VZE UI
        --
        IF NEW._match_event_name = 'match_person_by_manual_qa' and NEW.person_id is not null then
            NEW.person_match_status = 'matched_by_manual_qa';

            -- 
            -- Keep the record's crash_pk in sync with the provided person_id -
            -- we must grab the new person record's crash_pk from their unit record
            --
            SELECT units.crash_pk INTO matching_person_record_crash_pk
            FROM people
            LEFT JOIN units on units.id = people.unit_id
            WHERE people.id = NEW.person_id;

            IF matching_person_record_crash_pk IS DISTINCT FROM NEW.crash_pk then
                raise debug 'updating EMS record ID % crash_pk to % to match updated person_id', NEW.id, matching_person_record_crash_pk;
                NEW.crash_pk = matching_person_record_crash_pk;
                NEW.crash_match_status = 'matched_by_manual_qa';

            END IF;
            -- clear the _match_event_name
            NEW._match_event_name = null;
            return new;
        END IF;
        --
        -- The handle_matched_crash_pks_updated event is set via the EMS-crash matching trigger when
        -- the matched_crash_ids array is modified. It enables us to conditionally decide if we want 
        -- to `reset_crash_match`—which we want to do if the crash was not matched by manual Q/A.
        --
        -- This event keeps the crash and person matches in sync with crash inserts and edits.
        -- For example, this event enables a previously unmatched EMS record to be matched
        -- automatically at the crash and person level. It also allows an EMS record to move
        -- from `matched_by_automation` status to `multiple_matches_by_automation` if a second
        -- matching crash is receieved from CRIS.
        --
        IF NEW._match_event_name = 'handle_matched_crash_pks_updated' then
            IF NEW.crash_match_status = 'matched_by_manual_qa'
            OR NEW.person_match_status = 'matched_by_manual_qa'then
                -- nothing at all todo here
                -- person match is not affected by this change
                -- because crash_pk is not changing
                raise debug 'handle_matched_crash_pks_updated: nothing to do to EMS ID % because crash/person have been matched manually', NEW.id;
                NEW._match_event_name = NULL;
                return NEW;
            ELSE
                -- if crash/person have not been matched manually, we can handle the updated
                -- matched_crash_ids array as if we are resetting the match
                raise debug 'handle_matched_crash_pks_updated: change event name to `reset_crash_match` for EMS ID %', NEW.id;
                NEW._match_event_name = 'reset_crash_match';
            END IF;
        END IF;
        --
        -- reset_crash_match can be sent from the VZE UI (by clicking the Reset button), or
        -- via previous step in this function, when we handle the `handle_matched_crash_pks_updated`
        -- event for a crash which was not matched by manual review/qa
        --
        -- it serves the purpose of restoring/refreshing an EMS record to the crash and person
        -- match states based on whatever IDs are present in the `matched_crash_pks` column.
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
                NEW.person_id = NULL;
                NEW.person_match_status = 'unmatched';
                NEW.matched_person_ids = NULL;
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
            'reset_crash_match',
            'handle_person_record_created_or_updated'
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
                    --
                    -- Before we can assign the person_id, we must make sure that no other
                    -- EMS records are matched to this person ID. This is an edge case that 
                    -- can happen when one or more EMS records with different
                    -- **incident numbers** (`incident_number`) are matched to the same
                    -- crash. This is an edge case that occurs in < .5% of records
                    --
                    IF NOT EXISTS (
                        SELECT 1 FROM ems__incidents 
                        WHERE person_id = matching_person_ids[1] 
                        AND id != NEW.id
                    ) THEN
                        NEW.matched_person_ids = matching_person_ids;
                        NEW.person_id = matching_person_ids[1];
                        NEW.person_match_status = 'matched_by_automation';
                        NEW.person_match_attributes = ARRAY['sex', 'age', 'ethnicity'];
                        NEW.person_match_score = 99;
                        return NEW;
                    ELSE
                        raise debug 'Skipping person_id assignment because person_id is matched to another EMS record';
                        return NEW;
                    END IF;
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
    -- 
    -- Finally, we set NEW._match_event_name = null as a failsafe to make sure
    -- that this function never returns before nullifying _match_event_name.
    -- If _match_event_name is not nullified before this function returns we 
    -- will fail a check constraint on this column
    --
    NEW._match_event_name = null;
    return NEW;
END;
$function$
