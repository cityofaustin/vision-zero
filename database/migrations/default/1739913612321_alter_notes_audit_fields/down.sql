alter table crash_notes
    add column date timestamp with time zone DEFAULT now(),
    add column user_email text,
    alter column created_by set null,
    alter column updated_by set null;

alter table location_notes
    add column date timestamp with time zone DEFAULT now(),
    add column user_email text,
    alter column created_by set null,
    alter column updated_by set null;
