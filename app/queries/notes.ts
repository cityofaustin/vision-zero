import { gql } from "graphql-request";

export const INSERT_CRASH_NOTE = gql`
  mutation InsertCrashNote(
    $crashPk: Int!
    $text: String!
    $userEmail: String!
  ) {
    insert_crash_notes_one(
      object: {
        crash_pk: $crashPk
        text: $text
        user_email: $userEmail
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
    update_crash_notes(where: { id: { _eq: $id } }, _set: $updates) {
      returning {
        id
        date
        text
        user_email
      }
    }
  }
`;

export const DELETE_CRASH_NOTE = gql`
  mutation DeleteCrashNote($id: Int!) {
    delete_crash_notes(where: { id: { _eq: $id } }) {
      returning {
        id
      }
    }
  }
`;
