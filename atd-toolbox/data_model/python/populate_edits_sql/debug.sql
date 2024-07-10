with newdm as (
    select
        id,
        crash_id,
        vz_fatality_count
    from
        crashes_list_view
    where
        crash_date_ct > '2022-12-13'
        and crash_date_ct < '2024-01-01'
        and vz_fatality_count > 0
        and private_dr_fl = FALSE
        and in_austin_full_purpose = TRUE
)

select old.crash_id, newdm.crash_id as new_crash_id
from atd_txdot_crashes old
left join newdm on newdm.crash_id = old.crash_id
where
    old.crash_date > '2022-12-31' and
    old.crash_date < '2024-01-01' and
    old.atd_fatality_count > 0 and
    old.private_dr_fl = 'N'
    and old.in_austin_full_purpose = 'Y';
