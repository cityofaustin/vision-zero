import { gql } from "graphql-request";

export const INSERT_LOCATION_NOTE = gql`
  mutation InsertLocationNote(
    $recordId: String!
    $text: String!
    $userEmail: String!
  ) {
    insert_location_notes_one(
      object: { location_id: $recordId, text: $text, updated_by: $userEmail }
    ) {
      id
      text
      updated_at
      updated_by
    }
  }
`;

export const UPDATE_LOCATION_NOTE = gql`
  mutation UpdateLocationNote($id: Int!, $updates: location_notes_set_input!) {
    update_location_notes(where: { id: { _eq: $id } }, _set: $updates) {
      returning {
        id
        text
        updated_at
        updated_by
      }
    }
  }
`;

export const SOFT_DELETE_LOCATION_NOTE = gql`
  mutation SoftDeleteLocationNote($id: Int!) {
    update_location_notes(where: { id: { _eq: $id } }, _set: {is_deleted: true}) {
      returning {
        id
      }
    }
  }
`;
