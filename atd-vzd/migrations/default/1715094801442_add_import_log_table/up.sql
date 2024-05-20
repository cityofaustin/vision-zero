CREATE TABLE cris_import_log (
    id SERIAL PRIMARY KEY,
    object_path TEXT NOT NULL,
    object_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL,
    records_processed JSONB DEFAULT '{}',
    outcome_status TEXT NULL
);

COMMENT ON COLUMN cris_import_log.outcome_status IS 'This is a brief, textual indication of what the outcome was.';
COMMENT ON COLUMN cris_import_log.records_processed IS 'A JSON blob that contains counts or a list of crashes imported per schema';
COMMENT ON COLUMN cris_import_log.object_path IS 'The location within the bucket where the extract was found';
COMMENT ON COLUMN cris_import_log.object_name IS 'The name of the object (file) within the bucket';
COMMENT ON COLUMN cris_import_log.created_at IS 'Audit field for when the import started';
COMMENT ON COLUMN cris_import_log.completed_at IS 'Audit field for when the import finished';
