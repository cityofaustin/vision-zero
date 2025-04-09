import { gql } from "graphql-request";

export const GET_EMS_RECORD = gql`
  query EMSDetails($id: Int!) {
    ems__incidents(where: { id: { _eq: $id } }) {
      apd_incident_numbers
      crash_match_status
      crash_pk
      id
      incident_location_address
      incident_number
      incident_problem
      incident_received_datetime
      matched_crash_pks
      mvc_form_position_in_vehicle
      patient_injry_sev_id
      injry_sev {
        id
        label
      }
      pcr_patient_age
      pcr_patient_gender
      pcr_patient_race
      travel_mode
      crash {
        cris_crash_id
      }
    }
  }
`;

export const GET_MATCHING_CRASHES = gql`
  query EMSMatchingCrashes($crash_pks: [Int!]) {
    crashes(where: { id: { _in: $crash_pks } }) {
      id
      cris_crash_id
      record_locator
      case_id
      crash_timestamp
      fhe_collsn_id
      collsn {
        id
        label
      }
      address_primary
      address_secondary
      latitude
      longitude
      location_id
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
      }
    }
  }
`;
