CRASHES_QUERY = """
query SocrataExportCrashes($limit: Int! ,$offset: Int!) {
  socrata_export_crashes_view(order_by: {crash_id: asc}, limit: $limit, offset: $offset) {
    address_primary
    address_secondary
    apd_confirmed_death_count
    apd_confirmed_fatality
    bicycle_death_count
    bicycle_serious_injury_count
    case_id
    crash_date_ct
    crash_fatal_fl
    crash_id
    crash_sev_id
    crash_speed_limit
    crash_time_ct
    crash_timestamp
    fatality_count
    micromobility_death_count
    micromobility_serious_injury_count
    motor_vehicle_death_count
    motor_vehicle_serious_injury_count
    motorcycle_death_count
    motorcycle_serious_injury_count
    non_injry_count
    nonincap_injry_count
    onsys_fl
    other_death_count
    other_serious_injury_count
    pedestrian_death_count
    pedestrian_serious_injury_count
    poss_injry_count
    private_dr_fl
    road_constr_zone_fl
    rpt_block_num
    rpt_street_name
    rpt_street_sfx
    sus_serious_injry_count
    units_involved
    unkn_injry_count
    vz_fatality_count
  }
}
"""

# CRASHES_QUERY = """
# query SocrataExportCrashes($limit: Int! ,$offset: Int!) {
#   socrata_export_crashes_view(order_by: {crash_id: asc}, limit: $limit, offset: $offset) {
#     crash_timestamp
#     case_id
#     crash_date_ct
#     crash_fatal_fl
#     crash_id
#   }
# }
# """

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

QUERIES = {
    "people": PEOPLE_QUERY,
    "crashes": CRASHES_QUERY
}
