alter table db.crashes_cris add column created_at timestamptz not null default now();
alter table db.crashes_cris add column updated_at timestamptz not null default now();
alter table db.crashes_cris add column created_by text not null default 'system';
alter table db.crashes_cris add column updated_by text not null default 'system';
alter table db.units_cris add column created_at timestamptz not null default now();
alter table db.units_cris add column updated_at timestamptz not null default now();
alter table db.units_cris add column created_by text not null default 'system';
alter table db.units_cris add column updated_by text not null default 'system';
alter table db.people_cris add column created_at timestamptz not null default now();
alter table db.people_cris add column updated_at timestamptz not null default now();
alter table db.people_cris add column created_by text not null default 'system';
alter table db.people_cris add column updated_by text not null default 'system';
alter table db.charges_cris add column created_at timestamptz not null default now();
alter table db.charges_cris add column created_by text not null default 'system';
alter table db.crashes_edits add column created_at timestamptz not null default now();
alter table db.crashes_edits add column updated_at timestamptz not null default now();
alter table db.crashes_edits add column created_by text not null default 'system';
alter table db.crashes_edits add column updated_by text not null default 'system';
alter table db.units_edits add column created_at timestamptz not null default now();
alter table db.units_edits add column updated_at timestamptz not null default now();
alter table db.units_edits add column created_by text not null default 'system';
alter table db.units_edits add column updated_by text not null default 'system';
alter table db.people_edits add column created_at timestamptz not null default now();
alter table db.people_edits add column updated_at timestamptz not null default now();
alter table db.people_edits add column created_by text not null default 'system';
alter table db.people_edits add column updated_by text not null default 'system';
alter table db.crashes_unified add column created_at timestamptz not null default now();
alter table db.crashes_unified add column updated_at timestamptz not null default now();
alter table db.crashes_unified add column created_by text not null default 'system';
alter table db.crashes_unified add column updated_by text not null default 'system';
alter table db.units_unified add column created_at timestamptz not null default now();
alter table db.units_unified add column updated_at timestamptz not null default now();
alter table db.units_unified add column created_by text not null default 'system';
alter table db.units_unified add column updated_by text not null default 'system';
alter table db.people_unified add column created_at timestamptz not null default now();
alter table db.people_unified add column updated_at timestamptz not null default now();
alter table db.people_unified add column created_by text not null default 'system';
alter table db.people_unified add column updated_by text not null default 'system';

create or replace function db.set_updated_at_timestamp()
returns trigger
language plpgsql
as $function$
begin
    new.updated_at := now();
    return new;
end;
$function$;

create trigger set_updated_at_timestamp_crashes_cris
before update on db.crashes_cris
for each row
execute procedure db.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_crashes_edits
before update on db.crashes_edits
for each row
execute procedure db.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_crashes_unified
before update on db.crashes_unified
for each row
execute procedure db.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_units_cris
before update on db.units_cris
for each row
execute procedure db.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_units_edits
before update on db.units_edits
for each row
execute procedure db.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_units_unified
before update on db.units_unified
for each row
execute procedure db.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_people_cris
before update on db.people_cris
for each row
execute procedure db.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_people_edits
before update on db.people_edits
for each row
execute procedure db.set_updated_at_timestamp();


create trigger set_updated_at_timestamp_people_unified
before update on db.people_unified
for each row
execute procedure db.set_updated_at_timestamp();

