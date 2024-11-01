import { gql } from "graphql-request";

export const UPDATE_UNIT = gql`
  mutation UpdateUnits($id: Int!, $updates: units_set_input) {
    update_units_by_pk(pk_columns: { id: $id }, _set: $updates) {
      id
    }
  }
`;
