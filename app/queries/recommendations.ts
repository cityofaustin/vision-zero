import { gql } from "graphql-request";

export const RECOMMENDATION_STATUS_QUERY = gql`
  query GetRecStatuses {
    statuses: atd__recommendation_status_lkp(
      order_by: { rec_status_desc: desc }
    ) {
      id
      rec_status_desc
    }
  }
`;

export const RECOMMENDATION_PARTNERS_QUERY = gql`
  query GetPartners {
    partners: atd__coordination_partners_lkp(
      order_by: { coord_partner_desc: asc }
    ) {
      id
      coord_partner_desc
    }
  }
`;

export const INSERT_RECOMMENDATION_MUTATION = gql`
  mutation InsertRecommendation($record: recommendations_insert_input!) {
    insert_recommendations_one(object: $record) {
      id
    }
  }
`;

export const UPDATE_RECOMMENDATION_MUTATION = gql`
  mutation UpdateRecommendation(
    $record: recommendations_set_input!
    $id: Int!
    $partnerPksToDelete: [Int!]!
    $partnersToAdd: [recommendations_partners_insert_input!]!
  ) {
    update_recommendations_by_pk(pk_columns: { id: $id }, _set: $record) {
      id
    }
    delete_recommendations_partners(where: { id: { _in: $partnerPksToDelete } }) {
      affected_rows
    }
    insert_recommendations_partners(objects: $partnersToAdd) {
      affected_rows
    }
  }
`;
