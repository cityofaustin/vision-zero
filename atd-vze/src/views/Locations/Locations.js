import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";

import locationDataMap from "./locationDataMap";

import gqlAbstract from "../../queries/gqlAbstract";

// Our initial query configuration
let queryConf = {
  table: "atd_txdot_locations",
  single_item: "locations",
  columns: {
    unique_id: {
      primary_key: true,
      searchable: true,
      sortable: true,
      label_search: "Search by location id",
      label_table: "Location ID",
      type: "Int",
    },
    description: {
      searchable: true,
      sortable: false,
      label_search: "Search by intersecting street name",
      label_table: "Intersection",
      type: "String",
    },
  },
  order_by: {
    unique_id: "desc", // Unique ID desc by default
  },
  where: {},
  limit: 25,
  offset: 0,
};

let locationsQuery = new gqlAbstract(queryConf);

const Locations = () => (
  <GridTable
    query={locationsQuery}
    title={"Locations"}
    fieldMap={locationDataMap}
  />
);

export default withApollo(Locations);
