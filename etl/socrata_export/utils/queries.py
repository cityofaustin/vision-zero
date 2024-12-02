CRASHES_QUERY = """
query SocrataExportCrashes($limit: Int!, $minId: Int!) {
  socrata_export_crashes_view(limit: $limit, where: {id: {_gte: $minId}}) {
    active_school_zone_fl
    address_primary
    address_secondary
    apd_sector_id
    at_intrsct_fl
    bicycle_death_count
    bicycle_serious_injury_count
    case_id
    council_district
    cr3_processed_at
    cr3_stored_fl
    crash_fatal_fl
    crash_sev_id
    crash_speed_limit
    crash_timestamp
    crash_timestamp_ct
    created_at
    cris_crash_id
    death_cnt
    engineering_area_id
    fhe_collsn_id
    id
    in_austin_full_purpose
    intrsct_relat_id
    investigat_agency_id
    is_coa_roadway
    is_deleted
    is_temp_record
    latitude
    law_enf_fatality_count
    law_enforcement_ytd_fatality_num
    light_cond_id
    location_id
    longitude
    medical_advisory_fl
    micromobility_death_count
    micromobility_serious_injury_count
    motor_vehicle_death_count
    motor_vehicle_serious_injury_count
    motorcycle_death_count
    motorcycle_serious_injury_count
    non_injry_cnt
    nonincap_injry_cnt
    obj_struck_id
    onsys_fl
    other_death_count
    other_serious_injury_count
    pedestrian_death_count
    pedestrian_serious_injury_count
    point
    poss_injry_cnt
    private_dr_fl
    record_locator
    road_constr_zone_fl
    road_constr_zone_wrkr_fl
    rpt_block_num
    rpt_city_id
    rpt_cris_cnty_id
    rpt_hwy_num
    rpt_hwy_sfx
    rpt_rdwy_sys_id
    rpt_ref_mark_dir
    rpt_ref_mark_dist_uom
    rpt_ref_mark_nbr
    rpt_ref_mark_offset_amt
    rpt_road_part_id
    rpt_sec_block_num
    rpt_sec_hwy_num
    rpt_sec_hwy_sfx
    rpt_sec_rdwy_sys_id
    rpt_sec_road_part_id
    rpt_sec_street_desc
    rpt_sec_street_name
    rpt_sec_street_pfx
    rpt_sec_street_sfx
    rpt_street_desc
    rpt_street_name
    rpt_street_pfx
    rpt_street_sfx
    rr_relat_fl
    schl_bus_fl
    signal_engineer_area_id
    surf_cond_id
    surf_type_id
    sus_serious_injry_cnt
    thousand_damage_fl
    toll_road_fl
    tot_injry_cnt
    traffic_cntl_id
    txdot_rptable_fl
    units_involved
    unkn_injry_cnt
    updated_at
    wthr_cond_id
    years_of_life_lost
    zipcode
  }
}
"""

PEOPLE_QUERY = """
query SocrataExportPeople($limit: Int!, $minId: Int!) {
  socrata_export_people_view(order_by: {id: asc}, limit: $limit, where: {id: {_gte: $minId}}) {
    id
    cris_crash_id
    crash_pk
    crash_timestamp
    crash_timestamp_ct
    is_primary_person
    is_deleted
    is_temp_record
    mode_desc
    mode_id
    prsn_age
    prsn_ethnicity_id
    prsn_ethnicity_label
    prsn_injry_sev_id
    prsn_sex_label
    prsn_sex_id
    unit_id
  }
}
"""

CRASH_COMPONENTS_QUERY = """
query SocrataExportCrashComponents($limit: Int!, $minId: bigint!)  {
  moped_component_crashes(order_by: {id: asc}, limit: $limit, where: {id: {_gte: $minId}}) {
    id
    crash_pk
    mopd_proj_component_id
  }
}
"""


QUERIES = {
    "people": PEOPLE_QUERY,
    "crashes": CRASHES_QUERY,
    "crash_components": CRASH_COMPONENTS_QUERY,
}
