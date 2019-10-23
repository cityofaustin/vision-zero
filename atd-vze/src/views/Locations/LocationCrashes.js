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
              { latitude: "_is_null: true" },
              { longitude: "_is_null: true" },
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

  const widgetsConfig = [
    {
      getAggregateDataArg: "apd_confirmed_death_count",
      mainText: "Fatalities",
      icon: "fa fa-heartbeat",
      color: "danger",
    },
    {
      getAggregateDataArg: "sus_serious_injry_cnt",
      mainText: "Serious Injuries",
      icon: "fa fa-medkit",
      color: "warning",
    },
    {
      getAggregateDataArg: "years_of_life_lost",
      mainText: "Total Crashes",
      icon: "fa fa-hourglass-end",
      color: "info",
    },
    {
      getAggregateDataArg: "count",
      mainText: "Years of Life Lost",
      icon: "fa fa-cab",
      color: "success",
    },
    {
      getAggregateDataArg: "total_people",
      mainText: "Total People (Primary + Non-Primary)",
      icon: "fa fa-user",
      color: "dark",
    },
    {
      getAggregateDataArg: "total_units",
      mainText: "Total Units",
      icon: "fa fa-car",
      color: "secondary",
    },
  ];

  return (
    <GridTable
      query={crashesQuery}
      title={"Location Crashes"}
      filters={customFilters}
      columnsToExport={locationCrashesQueryExportFields}
      aggregateQueryConfig={aggregateQueryConfig}
      widgetsConfig={widgetsConfig}
    />
  );
}

export default withApollo(LocationCrashes);
