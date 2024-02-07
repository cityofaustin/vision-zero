-- Add in missing lookup values from CRIS into the autonomous level engaged lookup table

INSERT INTO "public"."atd_txdot__autonomous_level_engaged_lkp"("autonomous_level_engaged_id", "autonomous_level_engaged_desc") VALUES (3, E'CONDITIONAL AUTOMATION');

INSERT INTO "public"."atd_txdot__autonomous_level_engaged_lkp"("autonomous_level_engaged_id", "autonomous_level_engaged_desc") VALUES (4, E'HIGH AUTOMATION');

INSERT INTO "public"."atd_txdot__autonomous_level_engaged_lkp"("autonomous_level_engaged_id", "autonomous_level_engaged_desc") VALUES (5, E'FULL AUTOMATION');

UPDATE "public"."atd_txdot__autonomous_level_engaged_lkp" SET autonomous_level_engaged_desc = 'AUTOMATION LEVEL UNKNOWN' WHERE atd_txdot__autonomous_level_engaged_lkp = 6;
