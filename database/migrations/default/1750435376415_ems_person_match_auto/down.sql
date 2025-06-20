CREATE OR REPLACE FUNCTION public.ems_update_person_crash_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    matching_person_record RECORD;
BEGIN
    IF NEW.person_id is null
        THEN return NEW;
    END IF;
    -- Find matching person record
    SELECT id, crash_pk INTO matching_person_record 
    FROM people_list_view 
    WHERE id = NEW.person_id;

    NEW.crash_pk = matching_person_record.crash_pk;
    NEW.crash_match_status = 'matched_by_manual_qa';
    return NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ems_update_incident_crash_pk()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    matching_person_record RECORD;
BEGIN
    IF NEW.person_id is null
        THEN return null;
    END IF;
    -- Find matching person record
    SELECT id, crash_pk INTO matching_person_record 
    FROM people_list_view 
    WHERE id = NEW.person_id;
    
    -- Update crash_pk of related EMS if not already matched to a person
    UPDATE ems__incidents 
    SET 
        crash_pk = matching_person_record.crash_pk,
        updated_by = NEW.updated_by,
        crash_match_status = 'matched_by_manual_qa'
    WHERE
        id != NEW.id
        AND incident_number = NEW.incident_number
        AND crash_pk is distinct from matching_person_record.crash_pk
        AND person_id IS NULL;
    RETURN null;
END;
$function$;

--
-- add person_match_status column
--
alter table ems__incidents drop column person_match_status, drop matched_person_ids;

drop function if exists ems_update_person_crash_id;

