import { gql } from "apollo-boost";

export const GET_RECOMMENDATIONS = gql`
  query FindRecommendations($crashId: Int) {
    recommendations(where: {crash_id: {_eq: $crashId}}) {
      id
      created_at
      text
      created_by
      crash_id
      atd__coordination_partners_lkp {
        description
      }
      atd__recommendation_status_lkp {
        description
      }
    }
  }
`;
