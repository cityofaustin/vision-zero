import { gql } from "graphql-request";

export const INSERT_CHARGE = gql`
  mutation InsertCharge($updates: charges_cris_insert_input!) {
    insert_charges_cris_one(object: $updates) {
      id
      charge
      crash_pk
      unit_nbr
    }
  }
`;

export const UPDATE_CHARGE = gql`
  mutation UpdateCharge($id: Int!, $updates: charges_cris_set_input) {
    update_charges_cris_by_pk(pk_columns: { id: $id }, _set: $updates) {
      id
    }
  }
`;
