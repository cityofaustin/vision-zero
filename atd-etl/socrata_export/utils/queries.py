CRASHES_QUERY = """
query SocrataExportCrashes($limit: Int! ,$offset: Int!) {
  socrata_export_crashes_view(order_by: {crash_id: asc}, limit: $limit, offset: $offset) {
    address_primary
    address_secondary
    bicycle_death_count
    bicycle_serious_injury_count
    case_id
    crash_timestamp
    crash_timestamp_ct
    crash_fatal_fl
    crash_id
    crash_sev_id
    crash_speed_limit
    death_cnt
    law_enf_fatality_count
    micromobility_death_count
    micromobility_serious_injury_count
    motor_vehicle_death_count
    motor_vehicle_serious_injury_count
    motorcycle_death_count
    motorcycle_serious_injury_count
    non_injry_cnt
    nonincap_injry_cnt
    onsys_fl
    other_death_count
    other_serious_injury_count
    pedestrian_death_count
    pedestrian_serious_injury_count
    poss_injry_cnt
    private_dr_fl
    road_constr_zone_fl
    rpt_block_num
    rpt_street_name
    rpt_street_sfx
    sus_serious_injry_cnt
    units_involved
    unkn_injry_cnt
    vz_fatality_count
  }
}
"""

PEOPLE_QUERY = """
query SocrataExportPeople($limit: Int!, $offset: Int!) {
  socrata_export_people_view(order_by: {person_id: asc}, limit: $limit, offset: $offset) {
    crash_date_ct
    crash_id
    crash_time_ct
    crash_timestamp
    mode_desc
    mode_id
    person_id
    prsn_age
    prsn_ethnicity_id
    prsn_ethnicity_label
    prsn_injry_sev_id
    prsn_sex
    prsn_sex_id
    unit_id
  } 
}
"""

QUERIES = {"people": PEOPLE_QUERY, "crashes": CRASHES_QUERY}
