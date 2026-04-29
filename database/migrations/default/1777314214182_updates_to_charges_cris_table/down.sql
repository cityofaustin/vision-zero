drop trigger if exists set_charges_cris_person_id_and_crash_pk on charges_cris;

CREATE TRIGGER set_charges_cris_person_id_and_crash_pk 
BEFORE INSERT ON public.charges_cris 
FOR EACH ROW 
EXECUTE FUNCTION public.charges_cris_set_person_id_and_crash_pk();

alter table "public"."charges_cris" drop column "updated_by";

alter table "public"."charges_cris" drop column "updated_at";

alter table "public"."charges_cris" drop constraint "check_cris_crash_id_is_temp_dependency";

drop trigger if exists set_public_atd_apd_blueform_updated_at on "public"."charges_cris";
