import { gql } from "apollo-boost";

export const GET_LOCATION = gql`
  query GetLocation($id: String, $yearsAgoDate: date) {
    atd_txdot_locations(where: { location_id: { _eq: $id } }) {
      location_id
      address
      street_level
      description
      shape
      latitude
      longitude
      metadata
      last_update
      is_retired
      crashes_by_manner_collision(order_by: { count: desc }, limit: 5) {
        collsn_desc
        count
      }
    }
    locationTotals: get_location_totals(
      args: {
        cr3_crash_date: $yearsAgoDate
        noncr3_location: $id
        noncr3_crash_date: $yearsAgoDate
        cr3_location: $id
      }
    ) {
      total_crashes
      total_est_comp_cost
      noncr3_est_comp_cost
    }
  }
`;

export const UPDATE_LOCATION = gql`
  mutation update_atd_txdot_locations(
    $locationId: String
    $changes: atd_txdot_locations_set_input
  ) {
    update_atd_txdot_locations(
      where: { location_id: { _eq: $locationId } }
      _set: $changes
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_LOCATION_POLYGON = gql`
  mutation UpdateLocation($locationId: String, $updatedPolygon: geometry!) {
    update_atd_txdot_locations(
      where: { location_id: { _eq: $locationId } }
      _set: { shape: $updatedPolygon }
    ) {
      returning {
        shape
      }
    }
  }
`;

export const locationQueryExportFields = `
location_id
description
crashes_count_cost_summary { total_crashes }
crashes_count_cost_summary { total_deaths }
crashes_count_cost_summary { total_serious_injuries }
crashes_count_cost_summary { est_comp_cost }
`;
