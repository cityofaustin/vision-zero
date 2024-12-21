import { gql } from "graphql-request";

export const RECOMMENDATION_STATUS_QUERY = gql`
  query GetRecStatuses {
    statuses: atd__recommendation_status_lkp {
      id
      rec_status_desc
    }
  }
`;

export const INSERT_RECOMMENDATION_MUTATION = gql`
  mutation InsertRecommendation($object: recommendations_insert_input!) {
    insert_recommendations_one(object: $object) {
      id
    }
  }
`;

export const UPDATE_RECOMMENDATION_MUTATION = gql`
  mutation UpdateRecommendation(
    $object: recommendations_set_input!
    $id: Int!
  ) {
    update_recommendations_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;
