-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW view_crash_narratives_ocr_todo AS SELECT
    id,
    cris_crash_id
FROM crashes
WHERE
    cr3_stored_fl = true
    AND investigator_narrative IS null
    AND (
        investigator_narrative_ocr_processed_at IS null
        OR cr3_processed_at >= investigator_narrative_ocr_processed_at
    )
    AND updated_at > '2024-09-01 00:00:00+00'::timestamp with time zone
ORDER BY cr3_processed_at, id;
