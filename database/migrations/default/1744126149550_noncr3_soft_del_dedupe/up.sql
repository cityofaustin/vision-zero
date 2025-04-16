--
-- add fk column to atd_apd_blueform.case_id
--
alter table ems__incidents add column atd_apd_blueform_case_id integer;
alter table ems__incidents
add constraint ems__incidents_atd_apd_blueform_case_id_fkey foreign key (
    atd_apd_blueform_case_id
)
references public.atd_apd_blueform (
    case_id
) on update cascade on delete set null;

comment on column ems__incidents.atd_apd_blueform_case_id is 'The non-CR3 case ID matched to this record';

--
-- add timestamp audit fields 
--
alter table atd_apd_blueform add column created_at timestamptz not null default now();
alter table atd_apd_blueform add column updated_at timestamptz not null default now();
create trigger set_public_atd_apd_blueform_updated_at before update on public.atd_apd_blueform for each row execute function public.set_current_timestamp_updated_at();


--
-- add soft delete column
--
alter table atd_apd_blueform add is_deleted boolean not null default false;

comment on column atd_apd_blueform.is_deleted is 'Indicates soft-deletion';

--
-- add some indexes
--
create index ems__incidents_atd_apd_blueform_case_id_index on public.ems__incidents (
    atd_apd_blueform_case_id
);

create index atd_apd_blueform_is_deleted_index on public.atd_apd_blueform (
    is_deleted
);

create index crashes_case_id_investigat_agency_id_idx on public.crashes (
    case_id, investigat_agency_id
);

--
-- Trigger which soft-deletes atd_apd_blueform records if there is a cr3 crash
-- with the same case_id and investigat_agency_id is 74 (Austin PD)
--
create or replace function remove_dupe_non_cr3s()
returns trigger as $$
DECLARE
    text_case_id text;
BEGIN
    text_case_id := NEW.case_id::text;
    if exists (select 1 from crashes where case_id = text_case_id and investigat_agency_id = 74) then
        new.is_deleted = true;
    end if;
    return new;
END;
$$ language plpgsql;

create trigger remove_dupe_non_cr3s_insert_update_trigger
before insert or update on atd_apd_blueform
for each row execute function remove_dupe_non_cr3s();
