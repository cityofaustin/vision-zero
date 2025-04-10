import { gql } from "graphql-request";

export const GET_EMS_RECORDS = gql`
  query EMSDetails($incident_number: String!) {
    ems__incidents(where: { incident_number: { _eq: $incident_number } }) {
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

export const GET_MATCHING_PEOPLE = gql`
  query EMSMatchingCrashes($crash_pks: [Int!]) {
    people_list_view(
      where: { crash_pk: { _in: $crash_pks } }
      order_by: { cris_crash_id: asc, unit_nbr: asc, prsn_nbr: asc }
    ) {
      crash_pk
      crash_timestamp
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
      crash {
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
      }
      unit {
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
      }
    }
  }
`;
