import { gql } from "apollo-boost";

export const GET_LOCATION_NOTES = gql`
  query FindLocationNotes($locationId: String!) {
    location_notes(where: {location_id: {_eq: $locationId}}, order_by: {date: desc}) {
      id
      created_at
      updated_at
      date
      text
      user_email
      location_id
    }
  }
`;
