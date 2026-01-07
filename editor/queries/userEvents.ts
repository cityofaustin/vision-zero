import { gql } from "graphql-request";

export const INSERT_USER_EVENT = gql`
  mutation InsertUserEvent($event_name: String!, $user_email: String!) {
    insert_user_events_one(
      object: { event_name: $event_name, user_email: $user_email }
    ) {
      __typename
    }
  }
`;
