-- removing unused columns and setting audit fields to not nullable
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
