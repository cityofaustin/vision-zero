-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW _lookup_tables_view AS SELECT DISTINCT table_name
FROM information_schema.columns
WHERE table_schema::name = 'lookups'::name
ORDER BY table_name;
