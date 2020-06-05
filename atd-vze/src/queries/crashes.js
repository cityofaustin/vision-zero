import { gql } from "apollo-boost";

export const GET_CRASH = gql`
  query FindCrash($crashId: Int) {
    atd_txdot_crashes(where: { crash_id: { _eq: $crashId } }) {
      active_school_zone_fl
      address_confirmed_primary
      address_confirmed_secondary
      apd_confirmed_fatality
      apd_confirmed_death_count
      apd_human_update
      approval_date
      approved_by
      at_intrsct_fl
      case_id
      city_id
      cr3_stored_flag
      crash_date
      crash_fatal_fl
      crash_id
      crash_sev_id
      crash_speed_limit
      crash_time
      day_of_week
      death_cnt
      est_comp_cost
      est_econ_cost
      fhe_collsn_id
      geocode_method {
        name
      }
      geocode_date
      geocode_provider
      geocode_status
      geocoded
      hwy_nbr
      hwy_sfx
      hwy_sys
      hwy_sys_2
      intrsct_relat_id
      investigator_narrative
      is_retired
      last_update
      latitude
      latitude_primary
      latitude_geocoded
      light_cond_id
      longitude
      longitude_primary
      longitude_geocoded
      micromobility_device_flag
      non_injry_cnt
      nonincap_injry_cnt
      obj_struck_id
      onsys_fl
      poss_injry_cnt
      private_dr_fl
      qa_status
      road_constr_zone_fl
      road_type_id
      rpt_block_num
      rpt_city_id
      rpt_hwy_num
      rpt_latitude
      rpt_longitude
      rpt_outside_city_limit_fl
      rpt_rdwy_sys_id
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
      rpt_street_name
      rpt_street_pfx
      rpt_street_sfx
      rpt_street_desc
      rr_relat_fl
      schl_bus_fl
      speed_mgmt_points
      street_name
      street_name_2
      street_nbr
      street_nbr_2
      sus_serious_injry_cnt
      toll_road_fl
      tot_injry_cnt
      traffic_cntl_id
      unkn_injry_cnt
      updated_by
      wthr_cond_id
    }
    atd_txdot_primaryperson(where: { crash_id: { _eq: $crashId } }) {
      prsn_age
      prsn_injry_sev_id
      drvr_zip
      drvr_city_name
      injury_severity {
        injry_sev_desc
      }
      person_type {
        prsn_type_desc
      }
      unit_nbr
    }
    atd_txdot_person(where: { crash_id: { _eq: $crashId } }) {
      prsn_age
      prsn_injry_sev_id
      injury_severity {
        injry_sev_desc
      }
      person_type {
        prsn_type_desc
      }
      unit_nbr
    }
    atd_txdot_units(where: { crash_id: { _eq: $crashId } }) {
      unit_desc_id
      unit_nbr
      contrib_factr_1_id
      veh_make_id
      veh_mod_id
      veh_mod_year
      unit_description {
        veh_unit_desc_desc
      }
      make {
        veh_make_desc
      }
      model {
        veh_mod_desc
      }
      body_style {
        veh_body_styl_desc
      }
    }
    atd_txdot_charges(where: { crash_id: { _eq: $crashId } }) {
      citation_nbr
      charge_cat_id
      charge
    }
    atd_txdot_change_log(
      where: { record_type: { _eq: "crashes" }, record_id: { _eq: $crashId } }
      order_by: { record_type: asc }
    ) {
      change_log_id
      record_id
      record_crash_id
      record_json
      update_timestamp
      updated_by
    }
    atd_txdot_crash_locations(where: { crash_id: { _eq: $crashId } }) {
      location_id
    }
  }
`;

export const UPDATE_COORDS = gql`
  mutation update_atd_txdot_crashes(
    $crashId: Int
    $qaStatus: Int
    $geocodeProvider: Int
    $latitude: float8
    $longitude: float8
    $updatedBy: String
  ) {
    update_atd_txdot_crashes(
      where: { crash_id: { _eq: $crashId } }
      _set: {
        qa_status: $qaStatus
        geocode_provider: $geocodeProvider
        latitude_primary: $latitude
        longitude_primary: $longitude
        updated_by: $updatedBy
      }
    ) {
      returning {
        crash_id
      }
    }
  }
`;

export const UPDATE_CRASH = gql`
  mutation update_atd_txdot_crashes(
    $crashId: Int
    $changes: atd_txdot_crashes_set_input
  ) {
    update_atd_txdot_crashes(
      where: { crash_id: { _eq: $crashId } }
      _set: $changes
    ) {
      affected_rows
      returning {
        active_school_zone_fl
        approval_date
        approved_by
        apd_confirmed_fatality
        apd_confirmed_death_count
        at_intrsct_fl
        case_id
        city_id
        crash_date
        crash_fatal_fl
        crash_id
        crash_sev_id
        crash_speed_limit
        crash_time
        day_of_week
        fhe_collsn_id
        geocode_date
        geocode_provider
        geocode_status
        geocoded
        hwy_nbr
        hwy_sfx
        hwy_sys
        hwy_sys_2
        intrsct_relat_id
        investigator_narrative
        is_retired
        last_update
        latitude
        latitude_primary
        latitude_geocoded
        light_cond_id
        longitude
        longitude_primary
        longitude_geocoded
        non_injry_cnt
        nonincap_injry_cnt
        obj_struck_id
        onsys_fl
        poss_injry_cnt
        private_dr_fl
        qa_status
        road_constr_zone_fl
        road_type_id
        rpt_block_num
        rpt_hwy_num
        rpt_latitude
        rpt_longitude
        rpt_outside_city_limit_fl
        rpt_rdwy_sys_id
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
        street_name
        street_name_2
        street_nbr
        street_nbr_2
        sus_serious_injry_cnt
        toll_road_fl
        tot_injry_cnt
        traffic_cntl_id
        unkn_injry_cnt
        wthr_cond_id
        updated_by
      }
    }
  }
`;

export const crashQueryExportFields = `
crash_id
case_id
active_school_zone_fl
apd_confirmed_death_count
approval_date
approved_by
at_intrsct_fl
city_id
crash_date
crash_fatal_fl
crash_sev_id
crash_speed_limit
crash_time
day_of_week
death_cnt
est_comp_cost
fhe_collsn_id
geocode_date
geocode_provider
geocode_status
geocoded
hwy_nbr
hwy_sfx
hwy_sys
hwy_sys_2
intrsct_relat_id
investigator_narrative
is_retired
last_update
latitude
latitude_primary
latitude_geocoded
light_cond_id
longitude
longitude_primary
longitude_geocoded
non_injry_cnt
nonincap_injry_cnt
obj_struck_id
onsys_fl
poss_injry_cnt
private_dr_fl
qa_status
road_constr_zone_fl
road_type_id
rpt_block_num
rpt_city_id
rpt_hwy_num
rpt_latitude
rpt_longitude
rpt_outside_city_limit_fl
rpt_rdwy_sys_id
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
rpt_street_name
rpt_street_pfx
rpt_street_sfx
rpt_street_desc
rr_relat_fl
schl_bus_fl
speed_mgmt_points
street_name
street_name_2
street_nbr
street_nbr_2
sus_serious_injry_cnt
toll_road_fl
tot_injry_cnt
traffic_cntl_id
unkn_injry_cnt
updated_by
wthr_cond_id
units { body_style { veh_body_styl_desc } }
units { unit_description { veh_unit_desc_desc } }`;

export const locationCrashesQueryExportFields = `
crash_id
location_id
case_id
crash_date
crash_time
day_of_week
crash_sev_id
longitude_primary
latitude_primary
address_confirmed_primary
address_confirmed_secondary
non_injry_cnt
nonincap_injry_cnt
poss_injry_cnt
sus_serious_injry_cnt
tot_injry_cnt
death_cnt
unkn_injry_cnt
est_comp_cost
collision { collsn_desc }
units { body_style { veh_body_styl_desc } }
units { unit_description { veh_unit_desc_desc } }
`;
