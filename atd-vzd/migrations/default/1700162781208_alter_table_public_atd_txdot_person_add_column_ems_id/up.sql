alter table "public"."atd_txdot_person" add column "ems_id" integer
 null;

COMMENT ON COLUMN public.atd_txdot_person.ems_id IS 'This field holds the foreign key that references a single record in the ems__incidents table';
