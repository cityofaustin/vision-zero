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

export const GET_PARTNERS = gql`
  query FindPartners {
    atd__coordination_partners_lkp {
      id
      description
    }
  }
`;

export const GET_STATUS = gql`
  query FindStatus {
    atd__recommendation_status_lkp {
      id
      description
    }
  }
`;

// export const INSERT_RECOMMENDATION = gql`
//   mutation InsertNote($note: String!, $crashId: Int!, $userEmail: String){
//     insert_crash_notes(objects: {
//       text: $note
//       crash_id: $crashId
//       user_email: $userEmail
//     }) {
//       returning {
//         crash_id
//         text
//         date
//         user_email
//       }
//     }
//   }
// `;