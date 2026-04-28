drop trigger if exists set_charges_cris_person_id_and_crash_pk on charges_cris;

CREATE TRIGGER set_charges_cris_person_id_and_crash_pk 
BEFORE INSERT ON public.charges_cris 
FOR EACH ROW 
EXECUTE FUNCTION public.charges_cris_set_person_id_and_crash_pk()

alter table "public"."charges_cris" drop column "updated_by";

alter table "public"."charges_cris" drop column "updated_at";

alter table "public"."charges_cris" alter column "person_id" set not null;

alter table "public"."charges_cris" alter column "cris_crash_id" set not null;

alter table "public"."charges_cris" drop constraint "check_cris_crash_id_is_temp_dependency";

alter table "public"."charges_cris" drop column "is_temp";
