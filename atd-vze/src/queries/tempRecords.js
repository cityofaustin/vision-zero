import { gql } from "apollo-boost";

export const GET_TEMP_RECORDS = gql`
  query getTempRecords {
    crashes(
      where: { is_temp_record: { _eq: true } }
      order_by: { record_locator: desc }
    ) {
      record_locator
      case_id
      crash_timestamp
      updated_by
      updated_at
    }
  }
`;
