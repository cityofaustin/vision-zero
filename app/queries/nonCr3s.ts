import { gql } from "graphql-request";

export const INSERT_NON_CR3 = gql`
  mutation mutationInsertNonCR3($objects: [atd_apd_blueform_insert_input!]!) {
    insert_atd_apd_blueform(
      objects: $objects
      on_conflict: {
        constraint: atd_apd_blueform_pk
        update_columns: [date, case_id, address, longitude, latitude, hour]
      }
    ) {
      affected_rows
    }
  }
`;
