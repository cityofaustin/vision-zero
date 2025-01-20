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
  mutation UpdateCrashNote($crashPk: Int!, $text: String!, $userEmail: String!) {
    updateCrashNote(crashPk: $crashPk, text: $text, userEmail: $userEmail) {
      id
      date
      text
      user_email
    }
  }
`;