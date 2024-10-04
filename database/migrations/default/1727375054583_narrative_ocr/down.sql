drop view if exists view_crash_narratives_ocr_todo;

alter table crashes_edits
    drop column investigator_narrative_ocr_processed_at;

alter table crashes
    drop column investigator_narrative_ocr_processed_at;
