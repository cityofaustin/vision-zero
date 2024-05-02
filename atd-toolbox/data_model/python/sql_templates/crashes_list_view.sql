with injury_severities as (
    select
        id,
        unit_id,
        case
            when (prsn_injry_sev_id = 1) then 1
            else 0
        end as serious_injury,
        case
            when (prsn_injry_sev_id = 4) then 1
            else 0
        end as fatal_injury
    from
        db.people_unified
),

injury_counts as (
    select
        crashes.crash_id,
        sum(injury_severities.fatal_injury) as atd_fatality_count,
        sum(injury_severities.serious_injury) as serious_injury_count
    from
        db.crashes_unified as crashes
    left join db.units_unified as units on crashes.crash_id = units.crash_id
    left join injury_severities on units.id = injury_severities.unit_id
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
        end as geocode_source
    from db.crashes_edits
)

select
    db.crashes_unified.crash_id,
    db.crashes_unified.case_id,
    db.crashes_unified.crash_date,
    db.crashes_unified.private_dr_fl,
    db.crashes_unified.in_austin_full_purpose,
    db.crashes_unified.location_id,
    injury_counts.atd_fatality_count,
    injury_counts.serious_injury_count,
    est_comp_costs.est_comp_cost_crash_based,
    lookups.collsn_lkp.label as collsn_desc,
    geocode_sources.geocode_source

from
    db.crashes_unified
left join
    injury_counts
    on db.crashes_unified.crash_id = injury_counts.crash_id
left join
    est_comp_costs
    on db.crashes_unified.crash_id = est_comp_costs.crash_id
left join
    geocode_sources
    on db.crashes_unified.crash_id = geocode_sources.crash_id
left join
    lookups.collsn_lkp
    on db.crashes_unified.fhe_collsn_id = lookups.collsn_lkp.id;
