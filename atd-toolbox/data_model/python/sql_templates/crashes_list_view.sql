drop view if exists crash_injury_counts cascade;

create or replace view crash_injury_counts as with people_injury_severities as (
    select
        people.id,
        crashes.crash_id,
        people.est_comp_cost_crash_based,
        case
            when (people.prsn_injry_sev_id = 0) then 1
            else 0
        end as unkn_injry,
        case
            when (people.prsn_injry_sev_id = 1) then 1
            else 0
        end as sus_serious_injry,
        case
            when (people.prsn_injry_sev_id = 2) then 1
            else 0
        end as nonincap_injry,
        case
            when (people.prsn_injry_sev_id = 3) then 1
            else 0
        end as poss_injry,
        case
            when
                (people.prsn_injry_sev_id = 4 or people.prsn_injry_sev_id = 99)
                then 1
            else 0
        end as fatal_injury,
        case
            when
                (
                    people.prsn_injry_sev_id = 4
                    and crashes.in_austin_full_purpose = true
                    and crashes.private_dr_fl = false
                )
                then 1
            else 0
        end as vz_fatal_injury,
        case
            when
                (
                    people.prsn_injry_sev_id = 4
                    or people.prsn_injry_sev_id = 99
                    and crashes.law_enforcement_fatality_num is not null
                )
                then 1
            else 0
        end as law_enf_fatal_injury,
        case
            when (people_cris.prsn_injry_sev_id = 4) then 1
            else 0
        end as cris_fatal_injury,
        case
            when (people.prsn_injry_sev_id = 5) then 1
            else 0
        end as non_injry
    from
        public.people_unified as people
    left join public.units_unified as units on people.unit_id = units.id
    left join public.people_cris as people_cris on people.id = people_cris.id
    left join
        public.crashes_unified as crashes
        on units.crash_id = crashes.crash_id
)

select
    crashes.crash_id,
    sum(people_injury_severities.unkn_injry) as unkn_injry_count,
    sum(
        people_injury_severities.nonincap_injry
    ) as nonincap_injry_count,
    sum(people_injury_severities.poss_injry) as poss_injry_count,
    sum(people_injury_severities.non_injry) as non_injry_count,
    sum(people_injury_severities.sus_serious_injry) as sus_serious_injry_count,
    sum(people_injury_severities.fatal_injury) as fatality_count,
    sum(people_injury_severities.vz_fatal_injury) as vz_fatality_count,
    sum(people_injury_severities.law_enf_fatal_injury) as law_enf_fatality_count,
    sum(people_injury_severities.cris_fatal_injury) as cris_fatality_count,
    sum(est_comp_cost_crash_based) as est_comp_cost_crash_based
from
    public.crashes_unified as crashes
left join
    people_injury_severities
    on crashes.crash_id = people_injury_severities.crash_id
group by
    crashes.crash_id;


create or replace view crashes_list as with geocode_status as (
    select
        cris.crash_id,
        coalesce(
            (cris.latitude is null or cris.longitude is null),
            false
        ) as has_no_cris_coordinates,
        coalesce(
            (edits.latitude is not null and edits.longitude is not null),
            false
        ) as is_manual_geocode
    from public.crashes_cris as cris
    left join public.crashes_edits as edits on cris.crash_id = edits.crash_id
)

select
    public.crashes_unified.crash_id,
    public.crashes_unified.case_id,
    public.crashes_unified.crash_date,
    public.crashes_unified.address_primary,
    public.crashes_unified.address_secondary,
    public.crashes_unified.private_dr_fl,
    public.crashes_unified.in_austin_full_purpose,
    public.crashes_unified.location_id,
    public.crashes_unified.rpt_block_num,
    public.crashes_unified.rpt_street_pfx,
    public.crashes_unified.rpt_street_name,
    public.crashes_unified.rpt_sec_block_num,
    public.crashes_unified.rpt_sec_street_pfx,
    public.crashes_unified.rpt_sec_street_name,
    public.crashes_unified.latitude,
    public.crashes_unified.longitude,
    public.crashes_unified.light_cond_id,
    public.crashes_unified.wthr_cond_id,
    public.crashes_unified.active_school_zone_fl,
    public.crashes_unified.schl_bus_fl,
    public.crashes_unified.at_intrsct_fl,
    public.crashes_unified.onsys_fl,
    public.crashes_unified.traffic_cntl_id,
    public.crashes_unified.road_constr_zone_fl,
    public.crashes_unified.rr_relat_fl,
    public.crashes_unified.toll_road_fl,
    public.crashes_unified.intrsct_relat_id,
    public.crashes_unified.obj_struck_id,
    public.crashes_unified.crash_speed_limit,
    public.crashes_unified.council_district,
    crash_injury_counts.nonincap_injry_count,
    crash_injury_counts.poss_injry_count,
    crash_injury_counts.sus_serious_injry_count,
    crash_injury_counts.non_injry_count,
    crash_injury_counts.vz_fatality_count,
    crash_injury_counts.cris_fatality_count,
    crash_injury_counts.law_enf_fatality_count,
    crash_injury_counts.fatality_count,
    crash_injury_counts.unkn_injry_count,
    crash_injury_counts.est_comp_cost_crash_based,
    lookups.collsn_lkp.label as collsn_desc,
    geocode_status.is_manual_geocode,
    geocode_status.has_no_cris_coordinates,
    upper(
        to_char(
            public.crashes_unified.crash_date at time zone 'US/Central', 'dy'
        )
    ) as crash_day_of_week
from
    public.crashes_unified
left join
    crash_injury_counts
    on public.crashes_unified.crash_id = crash_injury_counts.crash_id
left join
    geocode_status
    on public.crashes_unified.crash_id = geocode_status.crash_id
left join
    lookups.collsn_lkp
    on public.crashes_unified.fhe_collsn_id = lookups.collsn_lkp.id;
