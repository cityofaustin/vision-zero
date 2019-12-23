import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";
import gqlAbstract from "../../queries/gqlAbstract";

import { crashChangesGridTableColumns } from "./crashChangesGridTableParameters";

// Our initial query configuration
let queryConf = {
  table: "atd_txdot_changes",
  single_item: "crashes",
  columns: crashChangesGridTableColumns,
  order_by: {},
  where: {
    city_id: "_eq: 22",
  },
  limit: 25,
  offset: 0,
};

let crashesQuery = new gqlAbstract(queryConf);

const CrashesChanges = () => (
  <GridTable query={crashesQuery} title={"Crash Record Changes"} />
);

export default withApollo(CrashesChanges);
