import { gql } from "apollo-boost";

export const UPDATE_FATALITY = gql`
  mutation UpdateFatalities(
    $personId: Int
    $crashId: Int
    $changes: fatalities_set_input
  ) {
    update_fatalities(
      where: {
        crash_id: { _eq: $crashId }
        _and: {
          _or: [
            { person_id: { _eq: $personId } }
            { primaryperson_id: { _eq: $personId } }
          ]
        }
      }
      _set: $changes
    ) {
      affected_rows
      returning {
        id
        primaryperson_id
        person_id
        crash_id
        victim_name
        is_deleted
      }
    }
  }
`;
