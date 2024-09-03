create or replace view _lookup_tables_view as (
    select distinct table_name
    from information_schema.columns
    where table_schema = 'lookups'
    order by table_name asc
);
