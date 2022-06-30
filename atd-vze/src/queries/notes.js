import { gql } from "apollo-boost";

export const GET_NOTES = gql`
  query FindNotes($crashId: Int) {
    notes(where: { crash_id: { _eq: $crashId } }) {
      id
      created_at
      updated_at
      date
      text
      user_email
      crash_id
    }
  }
`;

export const INSERT_NOTE = gql`
  mutation InsertNote (
    $note: notes_insert_input!) {
    insert_notes(
      objects: [$note]) {
      returning {
        text
        crash_id
      }
    }
  }
`;