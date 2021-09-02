-- ADD new `atd_fatality_count` column

ALTER TABLE "public"."atd_txdot_crashes" ADD COLUMN "atd_fatality_count" int4;

-- Populate `atd_fatality_count` column from death_cnt

UPDATE
	atd_txdot_crashes
SET
	atd_fatality_count = death_cnt;

-- DEPLOY NOTES:
-- DONT FORGET TO UPDATE ACCESS PERMISSION IN HASURA