import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";
import gqlAbstract from "../../queries/gqlAbstract";

import {
  crashGridTableColumns,
} from "./crashesInconsistentTableParameters";

// Our initial query configuration
let queryConf = {
  table: "view_crashes_inconsistent_numbers",
  single_item: "crashes",
  showDateRange: false,
  columns: crashGridTableColumns,
  where: {},
  order_by: {},
  limit: 25,
  offset: 0,
};

let exportFields = `
 atc_crash_id
 atc_death_cnt
 atu_death_cnt
 atpp_death_cnt
 atp_death_cnt
 sus_serious_injry_cnt
 atu_sus_serious_injry_cnt
 atpp_sus_serious_injry_cnt
 atp_sus_serious_injry_cnt
`

let crashesQuery = new gqlAbstract(queryConf);

const ReportsInconsistentKSI = () => (
  <GridTable
    query={crashesQuery}
    title={"Crashes with Inconsistent KSI Numbers"}
    filters={null}
    columnsToExport={exportFields}
  />
);

export default withApollo(ReportsInconsistentKSI);
