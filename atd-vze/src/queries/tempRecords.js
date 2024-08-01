import { gql } from "apollo-boost";

export const GET_TEMP_RECORDS = gql`
  query getTempRecords {
    crashes(
      where: {
        is_temp_record: { _eq: true }
        _and: { is_deleted: { _eq: false } }
      }
    ) {
      id
      record_locator
      case_id
      crash_timestamp
      updated_by
      updated_at
      units {
        id
        people {
          id
        }
      }
    }
  }
`;

export const SOFT_DELETE_TEMP_UNITS_CRASH = gql`
  mutation softDeleteTempRecord($recordId: Int!, $updatedBy: String!) {
    update_units_cris(
      where: { crash_id: { _eq: $recordId } }
      _set: { is_deleted: true, updated_by: $updatedBy }
    ) {
      returning {
        id
        crash_id
      }
    }
    update_crashes_cris_by_pk(
      pk_columns: { id: $recordId }
      _set: { is_deleted: true, updated_by: $updatedBy }
    ) {
      id
    }
  }
`;

export const SOFT_DELETE_TEMP_PEOPLE = gql`
  mutation softDeletePersonRecord($unitId: Int!, $updatedBy: String!) {
    update_people_cris(
      where: { unit_id: { _eq: $unitId } }
      _set: { is_deleted: true, updated_by: $updatedBy }
    ) {
      returning {
        id
        unit_id
      }
    }
  }
`;
