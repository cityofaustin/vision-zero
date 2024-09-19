create or replace view _lookup_tables_view as (
    select distinct table_name
    from information_schema.columns
    where table_schema = 'lookups'
    order by table_name asc
);

comment on view _lookup_tables_view is 'View which provides a list of tables in the "lookups" schema and is used by helper script to identify CRIS lookup table changes';
