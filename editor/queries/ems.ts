import { gql } from "graphql-request";

export const GET_EMS_RECORD = gql`
  query EMSDetails($id: Int!) {
    ems__incidents(where: { id: { _eq: $id } }) {
      id
      incident_location_address
    }
  }
`;

export const CRASH_NAV_SEARCH = gql`
  query CrashNavigationSearch($searchValue: String!) {
    record_locator: crashes(
      where: {
        record_locator: { _eq: $searchValue }
        is_deleted: { _eq: false }
      }
    ) {
      id
      record_locator
    }
    case_id: crashes(
      where: { case_id: { _eq: $searchValue }, is_deleted: { _eq: false } }
    ) {
      id
      record_locator
    }
  }
`;

export const UPDATE_CRASH = gql`
  mutation update_crashes($id: Int!, $updates: crashes_set_input) {
    update_crashes(where: { id: { _eq: $id } }, _set: $updates) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

export const CREATE_CRIS_CRASH = gql`
  mutation CreateCrash($crash: crashes_cris_insert_input!) {
    insert_crashes_cris(objects: [$crash]) {
      returning {
        id
      }
    }
  }
`;

export const DELETE_CRIS_CRASH = gql`
  mutation SoftDeleteCrisCrash($id: Int!, $updated_by: String!) {
    update_crashes_cris(
      where: { id: { _eq: $id }, is_temp_record: { _eq: true } }
      _set: { is_deleted: true, updated_by: $updated_by }
    ) {
      affected_rows
      returning {
        id
      }
    }
    update_units_cris(
      where: { crash_pk: { _eq: $id } }
      _set: { is_deleted: true, updated_by: $updated_by }
    ) {
      affected_rows
    }
    update_people_cris(
      where: { units_cris: { crash_pk: { _eq: $id } } }
      _set: { is_deleted: true, updated_by: $updated_by }
    ) {
      returning {
        id
        unit_id
      }
    }
  }
`;
