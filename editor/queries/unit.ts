import { gql } from "graphql-request";

export const UPDATE_UNIT = gql`
  mutation UpdateUnits($id: Int!, $updates: units_set_input) {
    update_units_by_pk(pk_columns: { id: $id }, _set: $updates) {
      id
    }
  }
`;

export const UNIT_TYPES_QUERY = gql`
  query UnitTypes {
    lookups_unit_desc {
      id
      label
    }
  }
`;

export const GET_CONTRIB_FACTORS = gql`
  query ContribFactors {
    lookups_contrib_factr {
      id
      label
    }
  }
`;
