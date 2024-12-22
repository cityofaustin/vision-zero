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
    $deletePartnerPks: [Int!]!
    $addPartners: [recommendations_partners_insert_input!]!
  ) {
    update_recommendations_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
    delete_recommendations_partners(where: { id: { _in: $deletePartnerPks } }) {
      affected_rows
    }
    insert_recommendations_partners(objects: $addPartners) {
      affected_rows
    }
  }
`;

// addPartners,
