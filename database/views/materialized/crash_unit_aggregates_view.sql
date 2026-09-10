-- Most recent migration: database/migrations/default/1787848628285_ems_crash_list_view/up.sql

DROP MATERIALIZED VIEW IF EXISTS crash_unit_aggregates_view;

CREATE MATERIALIZED VIEW crash_unit_aggregates_view AS
SELECT
    crashes.id,
    string_agg(DISTINCT mode_categories.label, ' & '::text) AS units_involved
FROM crashes
LEFT JOIN units ON crashes.id = units.crash_pk
LEFT JOIN lookups.mode_category mode_categories ON units.vz_mode_category_id = mode_categories.id
WHERE crashes.is_deleted = false
GROUP BY crashes.id;
