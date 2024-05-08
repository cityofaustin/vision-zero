CREATE TABLE cris_import_log (
    id SERIAL PRIMARY KEY,
    object_path TEXT NOT NULL,
    object_name TEXT NOT NULL,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    import_attempted BOOLEAN NOT NULL DEFAULT FALSE,
    import_successful BOOLEAN NOT NULL DEFAULT FALSE,
    import_time TIMESTAMPTZ DEFAULT NULL
);
