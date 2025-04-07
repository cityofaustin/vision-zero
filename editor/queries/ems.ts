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
