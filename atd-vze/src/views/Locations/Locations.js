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
  // TODO: Add CSV export columns and then add handling in gqlAbstract
  // Idea is to call method on query that returns gql string to req from DB
  // Handle with async CSVLink from react-csv library
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
