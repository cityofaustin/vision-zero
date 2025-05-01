alter table ems__incidents
drop constraint matched_crash_pks_non_null,
add column created_by text not null default 'system',
add column updated_by text not null default 'system';

comment on column ems__incidents.matched_crash_pks is 'The IDs of multiple crashes that were found to match this record. Set via trigger.''';

--
-- Trigger function that assigns an EMS record's crash_pk based on its
-- person_id and updates its crash_match_status
--
create or replace function ems_update_person_crash_id()
returns trigger as $$
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
$$ language plpgsql;

comment on function ems_update_person_crash_id is 'Sets the ems__incident crash_pk based on its person_id';

create or replace trigger ems_update_person_crash_id_trigger
before update on ems__incidents
for each row
when (old.person_id is distinct from new.person_id)
execute function ems_update_person_crash_id();


--
-- Trigger function that sets the ems__incident `crash_pk` of EMS records
-- which have the same incident_number as the updated record
--
create or replace function ems_update_incident_crash_pk()
returns trigger as $$
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
$$ language plpgsql;

comment on function ems_update_incident_crash_pk is 'Updates the crash_pk of all EMS records that share the same incident number. Serves as a complement to ems_update_person_crash_id, which controls the crash_pk of the updated EMS record.';

create or replace trigger ems_update_incident_crash_pk_trigger
after update on ems__incidents
for each row
when (old.person_id is distinct from new.person_id)
execute function ems_update_incident_crash_pk();
