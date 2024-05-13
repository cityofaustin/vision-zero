drop view if exists crashes_change_log_view cascade;

create view crashes_change_log_view as (
    select
        record_id as crash_id,
        *,
        'crash' as record_type
    from
        change_log_crashes
    union all
    select
        units.crash_id,
        change_log_units.*,
        'unit' as record_type
    from
        change_log_units
    left join units on change_log_units.record_id = units.id
    union all
    select
        crashes.crash_id as crash_id,
        change_log_people.*,
        'people' as record_type
    from
        change_log_people
    left join people on change_log_people.record_id = people.id
    left join units on people.id = units.id
    left join crashes on units.crash_id = crashes.crash_id
);
