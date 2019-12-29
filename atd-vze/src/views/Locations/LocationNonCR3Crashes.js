import React from "react";
import { withApollo } from "react-apollo";

import GridTable from "../../Components/GridTable";
import gqlAbstract from "../../queries/gqlAbstract";
import { locationCrashesQueryExportFields } from "../../queries/crashes";
import {
  nonCR3CrashGridTableColumns,
  crashGridTableAdvancedFilters,
} from "../Crashes/crashGridTableParameters";

function LocationNonCR3Crashes(props) {
  // Our initial query configuration
  let queryConf = {
    table: "atd_apd_blueform",
    single_item: "crashes",
    columns: nonCR3CrashGridTableColumns,
    order_by: {},
    where: {
      location_id: `_eq: "${props.locationId}"`,
    },
    limit: 25,
    offset: 0,
  };

  let crashesQuery = new gqlAbstract(queryConf);

  let customFilters = crashGridTableAdvancedFilters;

  return (
    <GridTable
      query={crashesQuery}
      title={"Non-CR3 Crashes"}
      filters={customFilters}
      columnsToExport={locationCrashesQueryExportFields}
    />
  );
}

export default withApollo(LocationNonCR3Crashes);
