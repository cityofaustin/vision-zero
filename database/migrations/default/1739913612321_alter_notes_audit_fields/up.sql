-- use replica mode to disable triggers
set session_replication_role = replica;

-- removing unused columns and setting audit fields to not nullable

update crash_notes set created_by = updated_by where created_by is null;

alter table crash_notes 
    drop column date,
    drop column user_email,
    alter column created_by set not null,
    alter column updated_by set not null;
    
alter table location_notes 
    drop column date,
    drop column user_email,
    alter column created_by set not null,
    alter column updated_by set not null;
