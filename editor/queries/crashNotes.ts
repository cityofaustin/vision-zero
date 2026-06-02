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

/**
 * Reassign all notes from one crash to another (for temp crash transfer).
 */
export const TRANSFER_CRASH_NOTES = gql`
  mutation TransferCrashNotes(
    $sourceCrashId: Int!
    $targetCrashId: Int!
    $updated_by: String!
  ) {
    update_crash_notes(
      where: { crash_pk: { _eq: $sourceCrashId } }
      _set: { crash_pk: $targetCrashId, updated_by: $updated_by }
    ) {
      affected_rows
    }
  }
`;
