import { gql } from "graphql-request";

export const GET_CRASH = gql`
  query CrashDetails($recordLocator: String!) {
    crashes(
      where: {
        _and: {
          record_locator: { _eq: $recordLocator }
          is_deleted: { _eq: false }
        }
      }
    ) {
      id
      cris_crash_id
      record_locator
      updated_at
      updated_by
      case_id
      crash_timestamp
      fhe_collsn_id
      collsn {
        id
        label
      }
      rpt_city_id
      city {
        id
        label
      }
      light_cond_id
      light_cond {
        id
        label
      }
      wthr_cond_id
      obj_struck {
        id
        label
      }
      obj_struck_id
      crash_speed_limit
      traffic_cntl_id
      address_primary
      rpt_block_num
      rpt_street_name
      rpt_street_desc
      rpt_road_part_id
      road_part {
        id
        label
      }
      rpt_rdwy_sys_id
      rwy_sys {
        id
        label
      }
      rpt_hwy_num
      rpt_street_pfx
      rpt_street_name
      rpt_street_sfx
      address_secondary
      rpt_sec_block_num
      rpt_sec_street_name
      rpt_sec_street_desc
      rpt_sec_road_part_id
      road_part_sec {
        id
        label
      }
      rpt_sec_rdwy_sys_id
      rwy_sys_sec {
        id
        label
      }
      rpt_sec_hwy_num
      rpt_sec_street_pfx
      rpt_sec_street_sfx
      active_school_zone_fl
      at_intrsct_fl
      onsys_fl
      private_dr_fl
      road_constr_zone_fl
      rr_relat_fl
      schl_bus_fl
      toll_road_fl
      law_enforcement_ytd_fatality_num
      investigator_narrative
      cr3_stored_fl
      latitude
      longitude
      location_id
      is_temp_record
      in_austin_full_purpose
      crash_injury_metrics_view {
        vz_fatality_count
        sus_serious_injry_count
        nonincap_injry_count
        poss_injry_count
        unkn_injry_count
        tot_injry_count
        years_of_life_lost
        est_comp_cost_crash_based
        est_total_person_comp_cost
        crash_injry_sev_id
        cris_fatality_count
        law_enf_fatality_count
      }
      units(order_by: { unit_nbr: asc }) {
        id
        unit_nbr
        veh_mod_year
        unit_desc_id
        unit_desc {
          id
          label
        }
        veh_body_styl_id
        veh_body_styl {
          id
          label
        }
        veh_make_id
        veh_make {
          id
          label
        }
        veh_mod_id
        veh_mod {
          id
          label
        }
        veh_trvl_dir_id
        trvl_dir {
          id
          label
        }
        movement_id
        movt {
          id
          label
        }
        contrib_factr {
          id
          label
        }
        contrib_factr_2 {
          id
          label
        }
        contrib_factr_3 {
          id
          label
        }
        contrib_factr_p1 {
          id
          label
        }
        contrib_factr_p2 {
          id
          label
        }
        unit_injury_metrics_view {
          vz_fatality_count
          sus_serious_injry_count
        }
      }
      people_list_view(order_by: { unit_nbr: asc, prsn_nbr: asc }) {
        crash_pk
        id
        prsn_nbr
        unit_nbr
        is_primary_person
        prsn_age
        drvr_city_name
        drvr_zip
        prsn_exp_homelessness
        prsn_first_name
        prsn_mid_name
        prsn_last_name
        prsn_injry_sev_id
        prsn_rest_id
        rest {
          id
          label
        }
        injry_sev {
          id
          label
        }
        prsn_type_id
        prsn_type {
          id
          label
        }
        prsn_gndr_id
        gndr {
          id
          label
        }
        prsn_ethnicity_id
        drvr_ethncty {
          id
          label
        }
        prsn_occpnt_pos_id
        occpnt_pos {
          id
          label
        }
      }
      charges_cris {
        unit_nbr
        prsn_nbr
        citation_nbr
        charge
      }
      crashes_list_view {
        crash_day_of_week
        is_manual_geocode
      }
      change_logs(order_by: { created_at: desc }) {
        id
        crash_pk
        created_at
        created_by
        operation_type
        record_id
        record_type
        record_json
      }
      recommendation {
        id
        created_at
        rec_text
        created_by
        crash_pk
        rec_update
        recommendation_status_id
        atd__recommendation_status_lkp {
          rec_status_desc
        }
        recommendations_partners {
          id
          partner_id
          recommendation_id
          coordination_partners {
            id
            label
          }
        }
      }
      crash_notes(
        where: { is_deleted: { _eq: false } }
        order_by: { created_at: asc }
      ) {
        id
        updated_by
        created_at
        text
        crash_pk
      }
      ems__incidents(
        where: { is_deleted: { _eq: false } }
        order_by: { id: asc }
      ) {
        id
        apd_incident_numbers
        crash_match_status
        incident_location_address
        incident_number
        incident_problem
        incident_received_datetime
        patient_injry_sev {
          id
          label
        }
        mvc_form_position_in_vehicle
        patient_injry_sev_id
        person {
          prsn_nbr
          unit_nbr
        }
        pcr_patient_age
        pcr_patient_gender
        pcr_patient_race
        person_id
        travel_mode
        unparsed_apd_incident_numbers
      }
    }
  }
`;

export const CRASH_NAV_SEARCH = gql`
  query CrashNavigationSearch($searchValue: String!) {
    record_locator: crashes(
      where: {
        record_locator: { _eq: $searchValue }
        is_deleted: { _eq: false }
      }
    ) {
      id
      record_locator
    }
    case_id: crashes(
      where: { case_id: { _eq: $searchValue }, is_deleted: { _eq: false } }
    ) {
      id
      record_locator
    }
  }
`;

export const UPDATE_CRASH = gql`
  mutation update_crashes($id: Int!, $updates: crashes_set_input) {
    update_crashes(where: { id: { _eq: $id } }, _set: $updates) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

export const CREATE_CRIS_CRASH = gql`
  mutation CreateCrash($crash: crashes_cris_insert_input!) {
    insert_crashes_cris(objects: [$crash]) {
      returning {
        id
      }
    }
  }
`;

export const DELETE_CRIS_CRASH = gql`
  mutation SoftDeleteCrisCrash($id: Int!, $updated_by: String!) {
    update_crashes_cris(
      where: { id: { _eq: $id }, is_temp_record: { _eq: true } }
      _set: { is_deleted: true, updated_by: $updated_by }
    ) {
      affected_rows
      returning {
        id
      }
    }
    update_units_cris(
      where: { crash_pk: { _eq: $id } }
      _set: { is_deleted: true, updated_by: $updated_by }
    ) {
      affected_rows
    }
    update_people_cris(
      where: { units_cris: { crash_pk: { _eq: $id } } }
      _set: { is_deleted: true, updated_by: $updated_by }
    ) {
      returning {
        id
        unit_id
      }
    }
  }
`;
