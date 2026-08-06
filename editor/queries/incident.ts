import { gql } from "graphql-request";

export const GET_INCIDENT = gql`
  query GetIncident($id: bigint!) {
    vz_incidents_list_view(where: { id: { _eq: $id } }) {
      address
      afd__incidents(order_by: { call_datetime: asc }) {
        id
        incident_number
        call_datetime
        address
        problem
      }
      cad_incidents(order_by: { response_date: asc }) {
        address
        agency_type_short
        call_disposition
        final_problem
        incident_type
        initial_problem
        is_cancelled_call
        latitude
        location_id
        longitude
        master_incident_number
        priority_description
        response_date
        time_first_unit_arrived
      }
      crashes(order_by: { crash_timestamp: asc }) {
        address_display
        agency {
          id
          label
        }
        crash_timestamp
        id
        in_austin_full_purpose
        location_id
        record_locator
        private_dr_fl
        collsn {
          id
          label
        }
      }
      ems__incidents(order_by: { incident_received_datetime: asc }) {
        crash {
          cris_crash_id
        }
        id
        incident_number
        incident_received_datetime
        incident_location_address
        travel_mode
        pcr_transport_destination
        crash_match_status
        person_match_status
        patient_injry_sev {
          id
          label
        }
      }
      id
      in_austin_full_purpose
      incident_numbers
      latitude
      location_ids
      longitude
      point_feature
      record_count
      record_tables_str
      record_tables
      record_timestamp
      responding_agencies_str
      responding_agencies
      vz_incident_records_view(order_by: { record_timestamp: asc })  {
        vz_incident_id
        geom
        record_id
        record_incident_number
        record_responding_agency
        record_table_name
        record_address
        record_timestamp
      }
    }
  }
`;
