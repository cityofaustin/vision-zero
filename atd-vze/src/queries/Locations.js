import { gql } from "apollo-boost";

export const GET_LOCATION = gql`
  query GetLocation($id: String, $fiveYearsAgo) {
    atd_txdot_locations(where: { location_id: { _eq: $id } }) {
      location_id
      address
      asmp_street_level
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
      crashes_count_cost_summary {
        est_comp_cost
        total_crashes
      }
    }
    fiveYearCrashTotal: atd_txdot_crashes_aggregate(where: {city_id: { _eq: 22 }, crash_date: {_gte: $fiveYearsAgo}, location: {location_id: {_eq: "5554677"}}}) {
      aggregate {
        count
      }
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
