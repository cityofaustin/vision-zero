-- drop trigger if exists
--     reset_investigator_narrative_ocr_processed_at_on_update on crashes_cris;

-- drop function if exists
--     public.reset_investigator_narrative_ocr_processed_at;

alter table crashes_edits
    drop column investigator_narrative_ocr_processed_at;

alter table crashes
    drop column investigator_narrative_ocr_processed_at;
