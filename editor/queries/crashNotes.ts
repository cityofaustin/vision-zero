import { gql } from "graphql-request";

export const INSERT_CRASH_NOTE = gql`
  mutation InsertCrashNote(
    $updates: crash_notes_insert_input!
  ) {
    insert_crash_notes_one(
      object: $updates
    ) {
      id
      text
      updated_at
      updated_by
    }
  }
`;

export const UPDATE_CRASH_NOTE = gql`
  mutation UpdateCrashNote($id: Int!, $updates: crash_notes_set_input!) {
    update_crash_notes(where: { id: { _eq: $id } }, _set: $updates) {
      returning {
        id
        text
        updated_at
        updated_by
      }
    }
  }
`;
