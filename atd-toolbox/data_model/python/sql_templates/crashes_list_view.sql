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
        count(serious_injuries.id) as serious_injuries_count,
        sum(people.est_comp_cost_crash_based) as est_comp_cost_crash_based
    from
        db.crashes_unified as crashes
    left join db.units_unified as units on crashes.crash_id = units.crash_id
    left join atd_fatalities on units.id = atd_fatalities.unit_id
    left join serious_injuries on units.id = serious_injuries.id
    left join db.people_unified as people on units.id = people.unit_id
    where
        crashes.in_austin_full_purpose = true
        and crashes.private_dr_fl = false
    group by
        crashes.crash_id
),

est_comp_costs as (
    select
        crashes.crash_id,
        sum(people.est_comp_cost_crash_based) as est_comp_cost_crash_based
    from
        db.crashes_unified as crashes
    left join db.units_unified as units on crashes.crash_id = units.crash_id
    left join db.people_unified as people on units.id = people.unit_id
    group by
        crashes.crash_id
),

geocode_sources as (
    select
        crash_id,
        case
            when
                (latitude is not null or longitude is not null)
                then 'manual_qa'
            else 'cris'
        end as source
    from db.crashes_edits
)

select
    db.crashes_unified.crash_id,
    db.crashes_unified.case_id,
    db.crashes_unified.crash_date,
    crash_injury_counts.atd_fatality_count,
    crash_injury_counts.serious_injuries_count,
    est_comp_costs.est_comp_cost_crash_based,
    lookups.collsn_lkp.label as collsn_desc,
    geocode_sources.source
from
    db.crashes_unified
left join
    crash_injury_counts
    on db.crashes_unified.crash_id = crash_injury_counts.crash_id
left join
    est_comp_costs
    on db.crashes_unified.crash_id = est_comp_costs.crash_id
left join
    geocode_sources
    on db.crashes_unified.crash_id = geocode_sources.crash_id
left join
    lookups.collsn_lkp
    on db.crashes_unified.fhe_collsn_id = lookups.collsn_lkp.id;
