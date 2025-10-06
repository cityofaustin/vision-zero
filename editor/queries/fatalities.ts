import { gql } from "graphql-request";

export const GET_FATALITIES = gql`
  query GetFatalities($recordLocator: String!) {
    fatalities_view(where: { record_locator: { _eq: $recordLocator } }) {
      record_locator
      person_id
      address_primary
      victim_name
      ytd_fatality
      ytd_fatal_crash
      case_id
      law_enforcement_ytd_fatality_num
      engineering_area_id
    }
  }
`;
