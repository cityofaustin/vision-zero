import { gql } from "apollo-boost";

export const UPDATE_UNIT = gql`
  mutation UpdateUnits($unitId: Int!, $changes: units_set_input) {
    update_units_by_pk(pk_columns: { id: $unitId }, _set: $changes) {
      id
    }
  }
`;
