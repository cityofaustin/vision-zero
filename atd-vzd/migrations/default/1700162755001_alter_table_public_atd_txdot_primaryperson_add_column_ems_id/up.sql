alter table "public"."atd_txdot_primaryperson" add column "ems_id" integer
 null;

COMMENT ON COLUMN public.atd_txdot_primaryperson.ems_id IS 'This field holds the foreign key that references a single record in the ems__incidents table.';
