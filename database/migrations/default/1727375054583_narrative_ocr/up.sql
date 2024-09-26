alter table crashes_edits
add column investigator_narrative_ocr_processed_at timestamp with time zone;

alter table crashes
add column investigator_narrative_ocr_processed_at timestamp with time zone;

comment on column crashes_edits.investigator_narrative_ocr_processed_at is 'The most recent
timestamp at which the OCR process attempted to extract the investigator narrative. If null, 
indicates that the OCR narrative extract has never been attempted. This value should be set
via ETL process.';

comment on column crashes.investigator_narrative_ocr_processed_at is 'The most recent
timestamp at which the OCR process attempted to extract the investigator narrative. If null, 
indicates that the OCR narrative extract has never been attempted. This value should be set
via ETL process on the crashes_edits table.';

create or replace view view_crash_narratives_ocr_todo as (
SELECT
    id,
    cris_crash_id
FROM
    crashes
WHERE
    cr3_stored_fl = TRUE
    AND investigator_narrative IS NULL
    and(investigator_narrative_ocr_processed_at IS NULL
        OR cr3_processed_at >= investigator_narrative_ocr_processed_at)
ORDER BY
    cr3_processed_at ASC,
    id ASC);

comment on view view_crash_narratives_ocr_todo is 'View which lists crashes which need to 
be processed by the OCR narrative extraction ETL'
