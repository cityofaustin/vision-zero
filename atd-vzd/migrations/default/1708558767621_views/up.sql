create or replace view crashes_list as with injury_severities as (
    select
        id,
        unit_id,
        est_comp_cost_crash_based,
        case
            when (prsn_injry_sev_id = 2) then 1
            else 0
        end as non_capacitating_injury,
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
        sum(
            injury_severities.non_capacitating_injury
        ) as non_capacitating_injury_count,
        sum(injury_severities.serious_injury) as serious_injury_count,
        sum(injury_severities.fatal_injury) as atd_fatality_count,
        sum(est_comp_cost_crash_based) as est_comp_cost_crash_based
    from
        db.crashes_unified as crashes
    left join db.units_unified as units on crashes.crash_id = units.crash_id
    left join injury_severities on units.id = injury_severities.unit_id
    group by
        crashes.crash_id
),

geocode_sources as (
    select
        cris.crash_id,
        coalesce(
            (cris.latitude is null or cris.longitude is null),
            false
        ) as has_no_cris_coordinates,
        case
            when
                (edits.latitude is not null or edits.longitude is not null)
                then 'manual_qa'
            else 'cris'
        end as geocode_source
    from db.crashes_cris as cris
    left join db.crashes_edits as edits on cris.crash_id = edits.crash_id
)

select
    db.crashes_unified.crash_id,
    db.crashes_unified.case_id,
    db.crashes_unified.crash_date,
    db.crashes_unified.address_primary,
    db.crashes_unified.address_secondary,
    db.crashes_unified.private_dr_fl,
    db.crashes_unified.in_austin_full_purpose,
    db.crashes_unified.location_id,
    injury_counts.non_capacitating_injury_count,
    injury_counts.serious_injury_count,
    injury_counts.atd_fatality_count,
    injury_counts.est_comp_cost_crash_based,
    lookups.collsn_lkp.label as collsn_desc,
    geocode_sources.geocode_source,
    geocode_sources.has_no_cris_coordinates
from
    db.crashes_unified
left join
    injury_counts
    on db.crashes_unified.crash_id = injury_counts.crash_id
left join
    geocode_sources
    on db.crashes_unified.crash_id = geocode_sources.crash_id
left join
    lookups.collsn_lkp
    on db.crashes_unified.fhe_collsn_id = lookups.collsn_lkp.id;

