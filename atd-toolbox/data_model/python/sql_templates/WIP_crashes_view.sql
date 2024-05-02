-- before indexes: 160ms locally
-- after: 150ms locally
with atd_fatalities as (
    select
        id,
        unit_id
    from
        db.people_unified
    where
        prsn_injry_sev_id = 4
),

serious_injuries as (
    select
        id,
        unit_id
    from
        db.people_unified
    where
        prsn_injry_sev_id = 1
),

crash_injury_counts as (
    select
        crashes.crash_id,
        count(atd_fatalities.id) as atd_fatality_count,
        count(serious_injuries.id) as serious_injuries_count
    from
        db.crashes_unified as crashes
    left join db.units_unified as units on crashes.crash_id = units.crash_id
    left join atd_fatalities on units.id = atd_fatalities.unit_id
    left join serious_injuries on units.id = serious_injuries.id
    where
        crashes.in_austin_full_purpose = true
        and crashes.private_dr_fl = false
    group by
        crashes.crash_id
)

select *
from
    db.crashes_unified
left join
    crash_injury_counts
    on db.crashes_unified.crash_id = crash_injury_counts.crash_id
where
    atd_fatality_count > 0
    and crash_date > '2023-01-01';

--
-- geocode status
--
with geocode_source as (
    select crash_id,
    case
        when (latitude is not null or longitude is not null) then 'manual_qa' 
    else 'cris'
    end as geocode_source
    from db.crashes_edits
)
select * from geocode_source;
