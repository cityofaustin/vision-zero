import { gql } from "apollo-boost";

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($personId: Int!, $changes: people_set_input) {
    update_people_by_pk(pk_columns: { id: $personId }, _set: $changes) {
      id
    }
  }
`;
