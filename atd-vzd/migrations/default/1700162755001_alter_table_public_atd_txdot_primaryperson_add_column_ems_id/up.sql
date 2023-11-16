alter table "public"."atd_txdot_primaryperson" add column "ems_id" integer
 null;

COMMENT ON COLUMN public.atd_txdot_primaryperson.ems_id IS 'This field has a foreign key relationship with the "id" field of the ems__incidents table.';
