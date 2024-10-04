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
    select
        id,
        cris_crash_id
    from
        crashes
    where
        cr3_stored_fl = TRUE
        and investigator_narrative is NULL
        and (
            investigator_narrative_ocr_processed_at is NULL
            or cr3_processed_at >= investigator_narrative_ocr_processed_at
        )
        -- this issue started in Sep 2024
        -- we do not OCR very old crashes
        and updated_at > '2024-09-01'
    order by
        cr3_processed_at asc,
        id asc
);

comment on view view_crash_narratives_ocr_todo is 'View which lists crashes which need to 
be processed by the OCR narrative extraction ETL'
