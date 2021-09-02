--
-- Adds column for narratives that won't be automatically overwritten by crash
-- record updates
--
ALTER TABLE "public"."atd_txdot_crashes" ADD COLUMN "investigator_narrative_ocr" text;

UPDATE
	atd_txdot_crashes
SET
	investigator_narrative_ocr = investigator_narrative
WHERE
	investigator_narrative IS NOT NULL