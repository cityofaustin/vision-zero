WITH crashes_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'crashes'
),
 crashes_cris_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'crashes_cris'
),
 crashes_edits_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'crashes_edits'
),
 all_crashes_columns AS (
    SELECT DISTINCT
        column_name

    FROM
        information_schema.columns
    WHERE
        TABLE_NAME in('crashes',
            'crashes_cris',
            'crashes')
),
units_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'units'
),
 units_cris_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'units_cris'
),
 units_edits_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'units_edits'
),
 all_units_columns AS (
    SELECT DISTINCT
        column_name

    FROM
        information_schema.columns
    WHERE
        TABLE_NAME in('units',
            'units_cris',
            'units')
),
people_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'people'
),
 people_cris_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'people_cris'
),
 people_edits_columns AS (
    SELECT
        TABLE_NAME,
        column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'people_edits'
),
 all_people_columns AS (
    SELECT DISTINCT
        column_name

    FROM
        information_schema.columns
    WHERE
        TABLE_NAME in('people',
            'people_cris',
            'people')
),
unified_column_view as (
SELECT
    'crashes' as record_type,
    all_crashes_columns.column_name,
    crashes_cris_columns.column_name as cris_column,
    crashes_edits_columns.column_name as edit_column,
    crashes_columns.column_name as unified_column
FROM
    all_crashes_columns
    left join crashes_cris_columns on crashes_cris_columns.column_name = all_crashes_columns.column_name
    left join crashes_edits_columns on crashes_edits_columns.column_name = all_crashes_columns.column_name
    left join crashes_columns on crashes_columns.column_name = all_crashes_columns.column_name
UNION ALL
SELECT
    'units' as record_type,
    all_units_columns.column_name,
    units_cris_columns.column_name as cris_column,
    units_edits_columns.column_name as edit_column,
    units_columns.column_name as unified_column
FROM
    all_units_columns
    left join units_cris_columns on units_cris_columns.column_name = all_units_columns.column_name
    left join units_edits_columns on units_edits_columns.column_name = all_units_columns.column_name
    left join units_columns on units_columns.column_name = all_units_columns.column_name
UNION ALL
SELECT
    'people' as record_type,
    all_people_columns.column_name,
    people_cris_columns.column_name as cris_column,
    people_edits_columns.column_name as edit_column,
    people_columns.column_name as unified_column
FROM
    all_people_columns
    left join people_cris_columns on people_cris_columns.column_name = all_people_columns.column_name
    left join people_edits_columns on people_edits_columns.column_name = all_people_columns.column_name
    left join people_columns on people_columns.column_name = all_people_columns.column_name
UNION ALL
SELECT
    'charges' as record_type,
    column_name,
    column_name as cris_column,
    null as edit_column,
    null as unified_column
FROM
    information_schema.columns
    where table_name = 'cris_charges')
select * from unified_column_view;
