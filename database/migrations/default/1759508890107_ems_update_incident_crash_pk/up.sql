--- This migration makes sure to not include deleted records in the update statement
CREATE OR REPLACE FUNCTION public.ems_update_incident_crash_pk()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
        AND person_id IS NULL
        AND is_deleted is false; -- Make sure we dont update crash_pk of deleted records
    RETURN null;
END;
$function$
;
