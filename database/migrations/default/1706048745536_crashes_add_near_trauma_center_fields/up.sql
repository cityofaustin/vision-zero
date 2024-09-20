-- Add new trauma center fields from CRIS to the crashes table
alter table "public"."atd_txdot_crashes" add column "near_trauma_center_id" integer
 null;
alter table "public"."atd_txdot_crashes" add column "near_trauma_center_distance" float8
 null;
