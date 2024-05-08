CREATE TABLE cris_import_log (
    id SERIAL PRIMARY KEY,
    object_path TEXT NOT NULL,
    object_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NULL,
    records_processed JSONB DEFAULT '{}',
    outcome_status TEXT NULL
);
