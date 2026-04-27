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
