import { gql } from "graphql-request";

export const INSERT_CRASH_NOTE = gql`
  mutation InsertCrashNote(
    $recordId: Int!
    $text: String!
    $userEmail: String!
  ) {
    insert_crash_notes_one(
      object: { crash_pk: $recordId, text: $text, updated_by: $userEmail, created_by: $userEmail }
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
