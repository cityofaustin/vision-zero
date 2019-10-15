import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";
import gqlAbstract from "../../queries/gqlAbstract";
import { crashQueryExportFields } from "../../queries/crashes";

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
  },
  limit: 25,
  offset: 0,
};

let crashesQuery = new gqlAbstract(queryConf);

let customFilters = {
  groupInjuries: {
    icon: "cab",
    label: "Deaths & Injuries",
    filters: [
      {
        id: "dni_deaths",
        label: "Deaths",
        filter: {
          where: [{ apd_confirmed_death_count: "_gt: 0" }],
        },
      },
      {
        id: "dni_serious_injuries",
        label: "Serious Injuries",
        filter: {
          where: [{ sus_serious_injry_cnt: "_gt: 0" }],
        },
      },
      {
        id: "dni_non_fatal",
        label: "Non-Fatal Injuries",
        filter: {
          where: [{ nonincap_injry_cnt: "_gt: 0" }],
        },
      },
    ],
  },
  groupGeography: {
    icon: "map-marker",
    label: "Geography",
    filters: [
      {
        id: "geo_no_coordinates",
        label: "No Latitude and Longitude",
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
    ],
  },
  groupUnitTypes: {
    icon: "bicycle",
    label: "Units Involved",
    filters: [
      {
        id: "pedestrian",
        label: "Pedestrian Involved",
        filter: {
          where: [
            {
              'units: { unit_description: { veh_unit_desc_desc: { _eq: "PEDESTRIAN" } } }': null
            },
          ],
        },
      },
      {
        id: "pedacyclist",
        label: "Cyclist Involved",
        filter: {
          where: [
            {
              'units: { unit_description: { veh_unit_desc_desc: { _eq: "PEDALCYCLIST" } } }': null
            },
          ],
        },
      },
      {
        id: "motorized_conveyance",
        label: "Motorized Conveyance Involved",
        filter: {
          where: [
            {
              'units: { unit_description: { veh_unit_desc_desc: { _eq: "MOTORIZED CONVEYANCE" } } }': null
            },
          ],
        },
      },
    ],
  },
  groupCase: {
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

const Crashes = () => (
  <GridTable
    query={crashesQuery}
    title={"Crashes Q/A"}
    filters={customFilters}
    columnsToExport={crashQueryExportFields}
  />
);

export default withApollo(Crashes);
