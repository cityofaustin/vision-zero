import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";

import gqlAbstract from "../../queries/gqlAbstract";

// Our initial query configuration
let queryConf = {
  table: "atd_txdot_locations",
  single_item: "locations",
  columns: {
    location_id: {
      primary_key: true,
      searchable: true,
      sortable: true,
      label_search: "Search by location id",
      label_table: "Location ID",
      type: "Integer",
    },
    description: {
      searchable: true,
      sortable: false,
      label_search: "Search by intersecting street name",
      label_table: "Intersection",
      type: "String",
    },
    "crashes_count_cost_summary { total_crashes }": {
      searchable: false,
      sortable: true,
      label_search: null,
      label_table: "Total Crashes",
      default_value: "0",
      type: "Integer",
    },
    "crashes_count_cost_summary { total_deaths }": {
      searchable: false,
      sortable: true,
      label_search: null,
      label_table: "Total Deaths",
      default_value: "0",
      type: "Integer",
    },
    "crashes_count_cost_summary { total_serious_injuries }": {
      searchable: false,
      sortable: true,
      label_search: null,
      label_table: "Total Serious Injry.",
      default_value: "0",
      type: "Integer",
    },
    "crashes_count_cost_summary { est_comp_cost }": {
      searchable: false,
      sortable: true,
      label_search: null,
      label_table: "Comp. Cost",
      default_value: 0,
      type: "Currency",
    },
  },
  order_by: {
    location_id: "desc", // Unique ID desc by default
  },
  where: {},
  limit: 25,
  offset: 0,
};

let locationsQuery = new gqlAbstract(queryConf);

const Locations = () => (
  <GridTable query={locationsQuery} title={"Locations"} />
);

export default withApollo(Locations);
