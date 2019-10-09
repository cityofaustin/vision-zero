import { gql } from "apollo-boost";

export const GET_CRASH = gql`
  query FindCrash($crashId: Int) {
    atd_txdot_crashes(where: { crash_id: { _eq: $crashId } }) {
      active_school_zone_fl
      approval_date
      approved_by
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
  ) {
    update_atd_txdot_crashes(
      where: { crash_id: { _eq: $crashId } }
      _set: {
        qa_status: $qaStatus
        geocode_provider: $geocodeProvider
        latitude_primary: $latitude
        longitude_primary: $longitude
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
        death_cnt
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
      }
    }
  }
`;

export const GET_LOOKUPS = gql`
  {
    atd_txdot__city_lkp {
      city_id
      city_desc
    }
    atd_txdot__collsn_lkp {
      collsn_id
      collsn_desc
    }
    atd_txdot__light_cond_lkp {
      light_cond_id
      light_cond_desc
    }
    atd_txdot__injry_sev_lkp {
      injry_sev_id
      injry_sev_desc
    }
    atd_txdot__intrsct_relat_lkp {
      intrsct_relat_id
      intrsct_relat_desc
    }
    atd_txdot__obj_struck_lkp {
      obj_struck_desc
      obj_struck_id
    }
    atd_txdot__road_part_lkp {
      road_part_id
      road_part_desc
    }
    atd_txdot__road_type_lkp {
      road_type_id
      road_type_desc
    }
    atd_txdot__rwy_sys_lkp {
      rwy_sys_id
      rwy_sys_desc
    }
    atd_txdot__traffic_cntl_lkp {
      traffic_cntl_id
      traffic_cntl_desc
    }
    atd_txdot__wthr_cond_lkp {
      wthr_cond_id
      wthr_cond_desc
    }
    atd_txdot__y_n_lkp {
      y_n_id
      y_n_desc
    }
  }
`;
