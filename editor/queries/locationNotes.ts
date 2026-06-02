import { gql } from "graphql-request";

export const INSERT_LOCATION_NOTE = gql`
  mutation InsertLocationNote(
    $updates: location_notes_insert_input!
  ) {
    insert_location_notes_one(
      object: $updates
    ) {
      id
      text
      updated_at
      updated_by
    }
  }
`;

export const UPDATE_LOCATION_NOTE = gql`
  mutation UpdateLocationNote($id: Int!, $updates: location_notes_set_input!) {
    update_location_notes(where: { id: { _eq: $id } }, _set: $updates) {
      returning {
        id
        text
        updated_at
        updated_by
      }
    }
  }
`;
