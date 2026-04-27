alter table "public"."charges_cris" add column "is_temp" boolean
 not null default 'false';

alter table "public"."charges_cris" add constraint "check_cris_crash_id_is_temp_dependency" check (cris_crash_id is not null or is_temp is true);

alter table "public"."charges_cris" alter column "cris_crash_id" drop not null;

alter table "public"."charges_cris" alter column "person_id" drop not null;

alter table "public"."charges_cris" add column "updated_at" timestamptz
 not null default now();

alter table "public"."charges_cris" add column "updated_by" text
 null default 'system';

drop trigger if exists set_charges_cris_person_id_and_crash_pk on charges_cris;

CREATE TRIGGER set_charges_cris_person_id_and_crash_pk BEFORE INSERT ON public.charges_cris FOR EACH ROW 
when (NEW.is_temp = false)
EXECUTE FUNCTION public.charges_cris_set_person_id_and_crash_pk();
