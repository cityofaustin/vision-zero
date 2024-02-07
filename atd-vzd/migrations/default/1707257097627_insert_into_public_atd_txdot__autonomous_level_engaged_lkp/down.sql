DELETE FROM "public"."atd_txdot__autonomous_level_engaged_lkp" WHERE "autonomous_level_engaged_id" = 3;

DELETE FROM "public"."atd_txdot__autonomous_level_engaged_lkp" WHERE "autonomous_level_engaged_id" = 4;

DELETE FROM "public"."atd_txdot__autonomous_level_engaged_lkp" WHERE "autonomous_level_engaged_id" = 5;

UPDATE "public"."atd_txdot__autonomous_level_engaged_lkp" SET autonomous_level_engaged_desc = 'AUTOMATION LEVEL ENGAGED UNKNOWN' WHERE atd_txdot__autonomous_level_engaged_lkp = 6;
