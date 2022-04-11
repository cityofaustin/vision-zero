create
or replace view check_vz_restore as (
    select
        movement_direction_corrections.*,
        crashes.qa_status,
        crashes.position
    from
        movement_direction_corrections
        join atd_txdot_crashes crashes on (
            movement_direction_corrections.crash_id = crashes.crash_id
        )
    where
        movement_direction_corrections.potential is true
        and not (
            1 = 1
            and crashes.qa_status = 3
            and last_update >= '2022-03-01'
            and movement_direction_corrections.cardinal_direction is true
        )
)