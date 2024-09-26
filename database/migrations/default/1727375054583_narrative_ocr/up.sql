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

-- create or replace function public.reset_investigator_narrative_ocr_processed_at()
-- returns trigger
-- language plpgsql
-- as $function$
-- BEGIN
--     update crashes_edits set investigator_narrative_ocr_processed_at = null where id = NEW.id;
-- END;
-- $function$;

-- create or replace trigger reset_investigator_narrative_ocr_processed_at_on_update
-- after update on public.crashes_cris
-- for each row
-- when (
--     new.cr3_processed_at is distinct from old.cr3_processed_at
-- )
-- execute procedure public.reset_investigator_narrative_ocr_processed_at();
