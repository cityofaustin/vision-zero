-- use replica mode to disable triggers
set session_replication_role = replica;

alter table crash_notes
    add column date timestamp with time zone DEFAULT now(),
    add column user_email text,
    alter column created_by drop not null,
    alter column updated_by drop not null;

alter table location_notes
    add column date timestamp with time zone DEFAULT now(),
    add column user_email text,
    alter column created_by drop not null,
    alter column updated_by drop not null;
