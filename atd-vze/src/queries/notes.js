import { gql } from "apollo-boost";

export const GET_NOTES = gql`
  query FindNotes($crashId: Int) {
    notes(where: {crash_id: {_eq: $crashId}}, order_by: {date: desc}) {
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
  mutation InsertNote($note: String!, $crashId: Int!, $userEmail: String){
    insert_notes(objects: {
      text: $note
      crash_id: $crashId
      user_email: $userEmail
    }) {
      returning {
        crash_id
        text
        date
        user_email
      }
    }
  }
`;