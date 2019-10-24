import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";
import gqlAbstract from "../../queries/gqlAbstract";
import { locationCrashesQueryExportFields } from "../../queries/crashes";

function LocationCrashes(props) {
  // Our initial query configuration
  let queryConf = {
    table: "atd_txdot_crashes",
    single_item: "crashes",
    columns: {
      crash_id: {
        primary_key: true,
        searchable: true,
        sortable: true,
        label_search: "Search by Crash ID",
        label_table: "Crash ID",
        type: "Int",
      },
      case_id: {
        searchable: true,
        sortable: true,
        label_search: "Search by Case Number",
        label_table: "Case Number",
        type: "String",
      },
      crash_date: {
        searchable: false,
        sortable: true,
        label_table: "Crash Date",
        type: "Date",
      },
      address_confirmed_primary: {
        searchable: true,
        sortable: true,
        label_search: "Search by Primary Address",
        label_table: "Primary Address",
        type: "String",
      },
      address_confirmed_secondary: {
        searchable: true,
        sortable: true,
        label_search: "Search by Secondary Address",
        label_table: "Secondary Address",
        type: "String",
      },
      sus_serious_injry_cnt: {
        searchable: false,
        sortable: true,
        label_table: "Serious Injury Count",
        type: "Int",
      },
      apd_confirmed_death_count: {
        searchable: false,
        sortable: true,
        label_table: "Death Count",
        type: "Date",
      },
      "collision { collsn_desc } ": {
        searchable: false,
        sortable: false,
        label_table: "Collision Description",
        type: "String",
      },
      "units { unit_description { veh_unit_desc_desc } }": {
        searchable: false,
        sortable: false,
        label_table: "Unit Description",
        type: "String",
      },
    },
    order_by: {},
    where: {
      city_id: "_eq: 22",
      location: `location_id: {_eq: "${props.locationId}"}`,
    },
    limit: 25,
    offset: 0,

    initStartDate: "01/01/2000",
  };

  let crashesQuery = new gqlAbstract(queryConf);

  let customFilters = {
    grp_injuries: {
      icon: "cab",
      label: "Deaths & Injuries",
      filters: [
        {
          id: "dni_deaths",
          label: "Deaths",
          filter: {
            where: [{ or: { apd_confirmed_death_count: "_gt: 0" } }],
          },
        },
        {
          id: "dni_serious_injuries",
          label: "Serious Injuries",
          filter: {
            where: [{ or: { sus_serious_injry_cnt: "_gt: 0" } }],
          },
        },
        {
          id: "dni_non_fatal",
          label: "Non-serious Injuries",
          filter: {
            where: [{ or: { nonincap_injry_cnt: "_gt: 0" } }],
          },
        },
      ],
    },
    grp_geograph: {
      icon: "map-marker",
      label: "Geography",
      filters: [
        {
          id: "geo_no_coordinates",
          label: "No Latitude and Longitude provided",
          filter: {
            where: [
              { latitude_primary: "_is_null: true" },
              { longitude_primary: "_is_null: true" },
            ],
          },
        },
        {
          id: "geo_geocoded",
          label: "Has been Geocoded",
          filter: {
            where: [{ geocoded: '_eq: "Y"' }],
          },
        },
        {
          id: "geo_confirmed_coordinates",
          label: "Confirmed Coordinates",
          filter: {
            where: [
              { latitude_primary: "_is_null: false" },
              { longitude_primary: "_is_null: false" },
            ],
          },
        },
      ],
    },
    grp_case: {
      icon: "vcard-o",
      label: "Internal",
      filters: [
        {
          id: "int_nocasenumber",
          label: "No Case Number",
          filter: {
            where: [{ case_id: "_is_null: true" }],
          },
        },
      ],
    },
  };

  // Configuration for aggregate queries that drive <GridTableWidgets />
  const aggregateQueryConfig = [
    {
      table: "atd_txdot_crashes_aggregate",
      columns: [`count`, `sum { apd_confirmed_death_count }`],
    },
    {
      table: "atd_txdot_primaryperson_aggregate",
      columns: [
        `count`,
        `sum { sus_serious_injry_cnt
               years_of_life_lost }`,
      ],
      key: "crash",
    },
    {
      table: "atd_txdot_person_aggregate",
      columns: [
        `count`,
        `sum { sus_serious_injry_cnt
               years_of_life_lost }`,
      ],
      key: "crash",
    },
    {
      table: "atd_txdot_units_aggregate",
      columns: [`count`],
      key: "crash",
    },
  ];

  // Configuration for widget styles and data that populates them
  // Using lodash.get() here to expose nested data which requires
  // each node in object to be passed as an array of strings
  // Ex. reference for `test` in {a: {b: `test`}} is ["a", "b"]
  const widgetsConfig = [
    {
      mainText: "Fatalities",
      icon: "fa fa-heartbeat",
      color: "danger",
      dataPath: [
        "atd_txdot_crashes_aggregate",
        "aggregate",
        "sum",
        "apd_confirmed_death_count",
      ],
      sum: false, // Is the data a sum of multiple aggregates
    },
    {
      mainText: "Serious Injuries",
      icon: "fa fa-medkit",
      color: "warning",
      dataPath: [
        [
          "atd_txdot_primaryperson_aggregate",
          "aggregate",
          "sum",
          "sus_serious_injry_cnt",
        ],
        [
          "atd_txdot_person_aggregate",
          "aggregate",
          "sum",
          "sus_serious_injry_cnt",
        ],
      ],
      sum: true,
    },
    {
      mainText: "Years of Life Lost",
      icon: "fa fa-hourglass-end",
      color: "info",
      dataPath: [
        [
          "atd_txdot_primaryperson_aggregate",
          "aggregate",
          "sum",
          "years_of_life_lost",
        ],
        [
          "atd_txdot_person_aggregate",
          "aggregate",
          "sum",
          "years_of_life_lost",
        ],
      ],
      sum: true,
    },
    {
      mainText: "Total Crashes",
      icon: "fa fa-cab",
      color: "success",
      dataPath: ["atd_txdot_crashes_aggregate", "aggregate", "count"],
      sum: false,
    },
    {
      mainText: "Total People (Primary + Non-Primary)",
      icon: "fa fa-user",
      color: "dark",
      dataPath: [
        ["atd_txdot_primaryperson_aggregate", "aggregate", "count"],
        ["atd_txdot_person_aggregate", "aggregate", "count"],
      ],
      sum: true,
    },
    {
      mainText: "Total Units",
      icon: "fa fa-car",
      color: "secondary",
      dataPath: ["atd_txdot_units_aggregate", "aggregate", "count"],
      sum: false,
    },
  ];

  const chartConfig = {
    totalRecordsPath: ["atd_txdot_crashes_aggregate", "aggregate", "count"],
    horizontalBarChart: {
      labels: [
        "ONE MOTOR VEHICLE - GOING STRAIGHT",
        "ONE MOTOR VEHICLE - TURNING RIGHT",
        "ONE MOTOR VEHICLE - TURNING LEFT",
        "ONE MOTOR VEHICLE - BACKING",
        "ONE MOTOR VEHICLE - OTHER",
        "ANGLE - BOTH GOING STRAIGHT",
        "ANGLE - ONE STRAIGHT-ONE BACKING",
        "ANGLE - ONE STRAIGHT-ONE STOPPED",
        "ANGLE - ONE STRAIGHT-ONE RIGHT TURN",
        "ANGLE - ONE STRAIGHT-ONE LEFT TURN",
        "ANGLE - BOTH RIGHT TURN",
        "ANGLE - ONE RIGHT TURN-ONE LEFT TURN",
        "ANGLE - ONE RIGHT TURN-ONE STOPPED",
        "ANGLE - BOTH LEFT TURN",
        "ANGLE - ONE LEFT TURN-ONE STOPPED",
        "SAME DIRECTION - BOTH GOING STRAIGHT-REAR END",
        "SAME DIRECTION - BOTH GOING STRAIGHT-SIDESWIPE",
        "SAME DIRECTION - ONE STRAIGHT-ONE STOPPED",
        "SAME DIRECTION - ONE STRAIGHT-ONE RIGHT TURN",
        "SAME DIRECTION - ONE STRAIGHT-ONE LEFT TURN",
        "SAME DIRECTION - BOTH RIGHT TURN",
        "SAME DIRECTION - ONE RIGHT TURN-ONE LEFT TURN",
        "SAME DIRECTION - ONE RIGHT TURN-ONE STOPPED",
        "SAME DIRECTION - BOTH LEFT TURN",
        "SAME DIRECTION - ONE LEFT TURN-ONE STOPPED",
        "OPPOSITE DIRECTION - BOTH GOING STRAIGHT",
        "OPPOSITE DIRECTION - ONE STRAIGHT-ONE BACKING",
        "OPPOSITE DIRECTION - ONE STRAIGHT-ONE STOPPED",
        "OPPOSITE DIRECTION - ONE STRAIGHT-ONE RIGHT TURN",
        "OPPOSITE DIRECTION - ONE STRAIGHT-ONE LEFT TURN",
        "OPPOSITE DIRECTION - ONE BACKING-ONE STOPPED",
        "OPPOSITE DIRECTION - ONE RIGHT TURN-ONE LEFT TURN",
        "OPPOSITE DIRECTION - ONE RIGHT TURN-ONE STOPPED",
        "OPPOSITE DIRECTION - BOTH LEFT TURNS",
        "OPPOSITE DIRECTION - ONE LEFT TURN-ONE STOPPED",
        "OTHER - ONE STRAIGHT-ONE ENTERING OR LEAVING PARKI",
        "OTHER - ONE RIGHT TURN-ONE ENTERING OR LEAVING PAR",
        "OTHER - ONE LEFT TURN-ONE ENTERING OR LEAVING PARK",
        "OTHER - ONE ENTERING OR LEAVING PARKING SPACE-ONE",
        "OTHER - BOTH ENTERING OR LEAVING A PARKING SPACE",
        "OTHER - BOTH BACKING",
        "OTHER",
      ],
      title: "Number of Collisions",
      table: "atd_txdot_crashes",
      nestedKey: "collision",
      // Using lodash.get(), array is arg that translates to unit.unit_description.veh_unit_desc_desc
      nestedPath: ["collsn_desc"],
      // Is value of table.nestedKey.nestedPath a single record or array
      isSingleRecord: true,
    },
    doughnutChart: {
      labels: [
        "MOTOR VEHICLE",
        "TRAIN",
        "PEDALCYCLIST",
        "PEDESTRIAN",
        "MOTORIZED CONVEYANCE",
        "TOWED/PUSHED/TRAILER",
        "NON-CONTACT",
        "OTHER",
      ],
      title: "Types of Vehicles - Count Distribution",
      table: "atd_txdot_crashes",
      nestedKey: "units",
      // Using lodash.get(), array is arg that translates to unit.unit_description.veh_unit_desc_desc
      nestedPath: ["unit_description", "veh_unit_desc_desc"],
      // Is value of table.nestedKey.nestedPath a single record or array
      isSingleRecord: false,
    },
  };

  return (
    <GridTable
      query={crashesQuery}
      title={"Location Crashes"}
      filters={customFilters}
      columnsToExport={locationCrashesQueryExportFields}
      aggregateQueryConfig={aggregateQueryConfig}
      widgetsConfig={widgetsConfig}
      chartConfig={chartConfig}
    />
  );
}

export default withApollo(LocationCrashes);
