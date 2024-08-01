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
        }
      }
    }
  }
`;

export const SOFT_DELETE_TEMP_RECORD = gql`
  mutation softDeleteTempRecord($recordId: Int!) {
    update_crashes_cris_by_pk(
      pk_columns: { id: $recordId }
      _set: { is_deleted: true }
    ) {
      id
    }
    update_units_cris(
      where: { crash_pk: { _eq: $recordId } }
      _set: { is_deleted: true }
    ) {
      id
      crash_pk
    }
  }
`;
