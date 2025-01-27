import { gql } from "graphql-request";

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($id: Int!, $updates: people_set_input) {
    update_people_by_pk(pk_columns: { id: $id }, _set: $updates) {
      id
    }
  }
`;
