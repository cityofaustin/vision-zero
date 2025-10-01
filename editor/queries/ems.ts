import { gql } from "graphql-request";

export const GET_EMS_RECORDS = gql`
  query EMSDetails($incident_number: String!) {
    ems__incidents(
      where: { incident_number: { _eq: $incident_number } }

      order_by: { id: asc }
    ) {
      apd_incident_numbers
      is_deleted
      crash_match_status
      person_match_status
      non_cr3_match_status
      atd_apd_blueform_case_id
      matched_non_cr3_case_ids
      crash_pk
      id
      incident_location_address
      incident_number
      incident_problem
      incident_received_datetime
      latitude
      longitude
      matched_crash_pks
      mvc_form_position_in_vehicle
      patient_injry_sev_id
      patient_injry_sev {
        id
        label
      }
      patient_injry_sev_reason
      pcr_patient_age
      pcr_patient_gender
      pcr_patient_race
      pcr_transport_destination
      person_id
      travel_mode
      unparsed_apd_incident_numbers
      crash {
        cris_crash_id
      }
    }
  }
`;

export const GET_UNMATCHED_EMS_CRASHES = gql`
  query EMSUnmatchedCrashes(
    $time4HoursBefore: timestamptz!
    $time4HoursAfter: timestamptz!
  ) {
    crashes(
      where: {
        crash_timestamp: { _gte: $time4HoursBefore, _lte: $time4HoursAfter }
      }
    ) {
      id
      cris_crash_id
      crash_timestamp
    }
  }
`;

export const GET_MATCHING_PEOPLE = gql`
  query EMSMatchingCrashes($crash_pks: [Int!]) {
    people_list_view(
      where: { crash_pk: { _in: $crash_pks } }
      order_by: {
        crash_timestamp: asc
        crash_pk: asc
        unit_nbr: asc
        prsn_nbr: asc
      }
    ) {
      crash_pk
      crash_timestamp
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
      injry_sev {
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
      prsn_taken_to
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
      ems_pcr {
        id
      }
    }
  }
`;

export const GET_NON_CR3_CRASHES = gql`
  query EMSNonCR3Crashes($case_ids: [Int!]) {
    atd_apd_blueform(where: { case_id: { _in: $case_ids } }) {
      case_id
      address
      case_timestamp
    }
  }
`;

export const UPDATE_EMS_PCR_CRASH_AND_PERSON = gql`
  mutation UpdateEMSPersonCrashStatus($id: Int!, $person_id: Int!) {
    update_ems__incidents(
      where: { id: { _eq: $id } }
      _set: {
        person_id: $person_id
        _match_event_name: "match_person_by_manual_qa"
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_EMS_PCR = gql`
  mutation UpdateEMSPCR($id: Int!, $updates: ems__incidents_set_input) {
    update_ems__incidents(where: { id: { _eq: $id } }, _set: $updates) {
      affected_rows
      returning {
        id
      }
    }
  }
`;
