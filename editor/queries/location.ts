import { gql } from "graphql-request";

export const GET_LOCATION = gql`
  query GetLocation($locationId: String!) {
    atd_txdot_locations(where: { location_id: { _eq: $locationId } }) {
      location_id
      street_level
      description
      geometry
      latitude
      longitude
      locations_list_view {
        cr3_crash_count
        non_cr3_crash_count
        total_est_comp_cost
      }
      location_notes(
        where: { is_deleted: { _eq: false } }
        order_by: { created_at: asc }
      ) {
        id
        updated_by
        created_at
        text
        location_id
      }
    }
  }
`;
