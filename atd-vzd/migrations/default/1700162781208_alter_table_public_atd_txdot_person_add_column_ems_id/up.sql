alter table "public"."atd_txdot_person" add column "ems_id" integer
 null;

COMMENT ON COLUMN public.atd_txdot_person.ems_id IS 'This field has a foreign key relationship with the "id" field of the ems__incidents table.';
