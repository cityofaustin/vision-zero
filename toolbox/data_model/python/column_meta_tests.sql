with crashes_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'crashes'
),

crashes_cris_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'crashes_cris'
),

crashes_edits_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'crashes_edits'
),

all_crashes_columns as (
    select distinct column_name
    from
        information_schema.columns
    where
        table_name in (
            'crashes',
            'crashes_cris',
            'crashes'
        )
),

units_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'units'
),

units_cris_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'units_cris'
),

units_edits_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'units_edits'
),

all_units_columns as (
    select distinct column_name
    from
        information_schema.columns
    where
        table_name in (
            'units',
            'units_cris',
            'units'
        )
),

people_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'people'
),

people_cris_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'people_cris'
),

people_edits_columns as (
    select
        table_name,
        column_name
    from
        information_schema.columns
    where
        table_name = 'people_edits'
),

all_people_columns as (
    select distinct column_name
    from
        information_schema.columns
    where
        table_name in (
            'people',
            'people_cris',
            'people'
        )
),

unified_column_view as (
    select
        'crashes' as record_type,
        all_crashes_columns.column_name,
        crashes_cris_columns.column_name as cris_column,
        crashes_edits_columns.column_name as edit_column,
        crashes_columns.column_name as unified_column
    from
        all_crashes_columns
    left join
        crashes_cris_columns
        on all_crashes_columns.column_name = crashes_cris_columns.column_name
    left join
        crashes_edits_columns
        on all_crashes_columns.column_name = crashes_edits_columns.column_name
    left join
        crashes_columns
        on all_crashes_columns.column_name = crashes_columns.column_name
    union all
    select
        'units' as record_type,
        all_units_columns.column_name,
        units_cris_columns.column_name as cris_column,
        units_edits_columns.column_name as edit_column,
        units_columns.column_name as unified_column
    from
        all_units_columns
    left join
        units_cris_columns
        on all_units_columns.column_name = units_cris_columns.column_name
    left join
        units_edits_columns
        on all_units_columns.column_name = units_edits_columns.column_name
    left join
        units_columns
        on all_units_columns.column_name = units_columns.column_name
    union all
    select
        'people' as record_type,
        all_people_columns.column_name,
        people_cris_columns.column_name as cris_column,
        people_edits_columns.column_name as edit_column,
        people_columns.column_name as unified_column
    from
        all_people_columns
    left join
        people_cris_columns
        on all_people_columns.column_name = people_cris_columns.column_name
    left join
        people_edits_columns
        on all_people_columns.column_name = people_edits_columns.column_name
    left join
        people_columns
        on all_people_columns.column_name = people_columns.column_name
    union all
    select
        'charges' as record_type,
        column_name,
        column_name as cris_column,
        null as edit_column,
        null as unified_column
    from
        information_schema.columns
    where
        table_name = 'cris_charges'
),

column_meta as (
    select
        column_name as meta_column_name,
        record_type,
        true as in_metadata_table,
        is_imported_from_cris
    from
        _column_metadata
),

metadata_debug_view as (
    select
        unified_column_view.*,
        in_metadata_table,
        is_imported_from_cris
    from
        unified_column_view
    left join column_meta on
        unified_column_view.column_name = column_meta.meta_column_name
        and unified_column_view.record_type = column_meta.record_type
)

select *
from
    metadata_debug_view;
