alter table ems__incidents
drop constraint matched_crash_pks_non_null,
add column created_by text not null default 'system',
add column updated_by text not null default 'system';

comment on column ems__incidents.matched_crash_pks is 'The IDs of multiple crashes that were found to match this record. Set via trigger.''';

--
-- Trigger function that sets the ems__incident `crash_pk` based on 
-- on the provided person_id and updates the crash_pk of all EMS records that
-- share the same incident number
--
create or replace function update_person_crash_ems_match()
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
    
    -- Update crah_pk of related EMS if not already matched to a crash
    UPDATE ems__incidents 
    SET 
        crash_pk = matching_person_record.crash_pk,
        updated_by = NEW.updated_by,
        crash_match_status = 'matched_by_manual_qa'
    WHERE
        incident_number = NEW.incident_number
        AND crash_pk is distinct from matching_person_record.crash_pk
        AND person_id IS NULL;

    RETURN NEW;
END;
$$ language plpgsql;


create or replace trigger ems_update_person_match_trigger
after update on ems__incidents
for each row 
when (old.person_id is distinct from new.person_id)
execute function update_person_crash_ems_match();
