--     old.crash_date >= '2018-01-01' and 
-- old.crash_date < '2024-01-01' and
-- 18203059 - missing a person record - https://github.com/cityofaustin/atd-data-tech/issues/7720
-- 180290542 this is a 'permanent' temp record? see https://github.com/cityofaustin/atd-data-tech/issues/15220
-- 18790889 - appears to be a missing / mismatched person record
-- 18848386 - appears to be a missing / mismatched person record
-- 19609765 - appears to be a missing / mismatched person record


-- all fatal crashes in the old schema that are missing in the new, based burely on the `atd_fatality_count` column
with newdm as (
    select
        id,
        crash_id,
        vz_fatality_count
    from
        crashes_list_view
    where
        vz_fatality_count > 0
        and private_dr_fl = FALSE
        and in_austin_full_purpose = TRUE
),

joined_crashes as (
    select
        old.crash_id,
        newdm.crash_id as new_crash_id
    from atd_txdot_crashes as old
    left join newdm on old.crash_id = newdm.crash_id
    where
        old.crash_date >= '2018-01-01'
        and old.crash_date < '2024-01-01'
        and old.atd_fatality_count > 0
        and old.private_dr_fl = 'N'
        and old.in_austin_full_purpose = 'Y'
)

select * from joined_crashes where new_crash_id is NULL;


-- sus serious injuries
-- 18551519 - crash not in the new db
-- 19200655 - the people record in the old db was not edited to reflect the injury. Xavier needs to review.
-- 18788739 - there are dupe people records in the old db. the best course of action will probably be to delete them.

with newdm as (
    select
        id,
        crash_id,
        crash_injry_sev_id
    from
        crashes_list_view
    where
        sus_serious_injry_count > 0
        and private_dr_fl = FALSE
        and in_austin_full_purpose = TRUE
),

joined_crashes as (
    select
        old.crash_id,
        newdm.crash_id as new_crash_id,
        newdm.crash_injry_sev_id as new_crash_injry_sev_id
    from atd_txdot_crashes as old
    left join newdm on old.crash_id = newdm.crash_id
    where
        old.crash_date >= '2018-01-01'
        and old.crash_date < '2024-01-01'
        and old.crash_sev_id = 1
        and old.private_dr_fl = 'N'
        and old.in_austin_full_purpose = 'Y'
)

select * from joined_crashes where new_crash_id is NULL;
