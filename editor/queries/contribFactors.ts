import { gql } from "graphql-request";

export const GET_CONTRIB_FACTORS = gql`
  query ContribFactors {
    lookups_contrib_factr {
      id
      label
    }
  }
`;
