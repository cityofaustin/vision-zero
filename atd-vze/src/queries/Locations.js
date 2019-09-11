import { gql } from "apollo-boost";

export const GET_LOCATION = gql`
  query GetLocation($id: String) {
    atd_txdot_locations(where: { unique_id: { _eq: $id } }) {
      unique_id
      address
      description
      geometry
      metadata
      last_update
      is_retired
    }
  }
`;
