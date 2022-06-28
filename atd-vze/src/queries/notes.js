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
