alter table "public"."atd_txdot_person" add column "peh_fl" boolean
 null;

COMMENT ON COLUMN public.atd_txdot_person.peh_fl IS 'Boolean flag that indicates whether the person was experiencing homelessness at the time of the crash.';
