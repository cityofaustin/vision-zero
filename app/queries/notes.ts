import { gql } from "graphql-request";


export const INSERT_CRASH_NOTE = gql`
  mutation InsertCrashNote($crashPk: Int!, $text: String!, $userEmail: String!) {
    insert_crash_notes_one(
      object: {
      crash_pk: $crashPk,
      text: $text,
      user_email: $userEmail,
      date: "now()"
    }
  ) {
    id
    text
    date
    user_email
    }
  }
`;

export const UPDATE_CRASH_NOTE = gql`
  mutation UpdateCrashNote($id: Int!, $updates: crash_notes_set_input!) {
    update_crash_notes_by_pk(
      pk_columns: { id: $id }
      _set: $updates
    ) {
      id
      crash_pk
      text
      date
      user_email
      created_at
      updated_at
      is_deleted
    }
  }
`;