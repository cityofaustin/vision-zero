import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";
import gqlAbstract from "../../queries/gqlAbstract";

import { crashChangesGridTableColumns } from "./crashChangesGridTableParameters";

// Our initial query configuration
let queryConf = {
  options: {
    useQuery: {
      fetchPolicy: 'no-cache'
    }
  },
  table: "atd_txdot_changes_view",
  single_item: "changes",
  columns: crashChangesGridTableColumns,
  order_by: {},
  where: {},
  limit: 25,
  offset: 0,
};

let crashesQuery = new gqlAbstract(queryConf);

const CrashesChanges = () => (
  <GridTable query={crashesQuery} title={"Crash Record Changes"} />
);

export default withApollo(CrashesChanges);
