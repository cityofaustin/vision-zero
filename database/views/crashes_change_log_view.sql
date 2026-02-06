-- Most recent migration: database/migrations/default/1727451511064_init/up.sql

CREATE OR REPLACE VIEW crashes_change_log_view AS SELECT
    concat('crash_', change_log_crashes.id) AS id,
    'crash'::text AS record_type,
    change_log_crashes.record_id AS crash_pk,
    change_log_crashes.record_id,
    CASE
        WHEN
            change_log_crashes.operation_type = 'INSERT'::text
            THEN 'create'::text
        ELSE lower(change_log_crashes.operation_type)
    END AS operation_type,
    change_log_crashes.record_json,
    change_log_crashes.created_at,
    change_log_crashes.created_by
FROM change_log_crashes
UNION ALL
SELECT
    concat('unit_', change_log_units.id) AS id,
    'unit'::text AS record_type,
    units.crash_pk,
    change_log_units.record_id,
    CASE
        WHEN
            change_log_units.operation_type = 'INSERT'::text
            THEN 'create'::text
        ELSE lower(change_log_units.operation_type)
    END AS operation_type,
    change_log_units.record_json,
    change_log_units.created_at,
    change_log_units.created_by
FROM change_log_units
LEFT JOIN units ON change_log_units.record_id = units.id
UNION ALL
SELECT
    concat('people_', change_log_people.id) AS id,
    'person'::text AS record_type,
    crashes.id AS crash_pk,
    change_log_people.record_id,
    CASE
        WHEN
            change_log_people.operation_type = 'INSERT'::text
            THEN 'create'::text
        ELSE lower(change_log_people.operation_type)
    END AS operation_type,
    change_log_people.record_json,
    change_log_people.created_at,
    change_log_people.created_by
FROM change_log_people
LEFT JOIN people ON change_log_people.record_id = people.id
LEFT JOIN units ON people.unit_id = units.id
LEFT JOIN crashes ON units.crash_pk = crashes.id;
