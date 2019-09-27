import { gql } from "apollo-boost";

export const GET_LOCATION = gql`
  query GetLocation($id: String) {
    atd_txdot_locations(where: { unique_id: { _eq: $id } }) {
      unique_id
      address
      description
      shape
      latitude
      longitude
      metadata
      last_update
      is_retired
    }
  }
`;
