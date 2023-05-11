import React from "react";
import { withApollo } from "react-apollo";

import { subYears } from "date-fns";
import GridTable from "../../Components/GridTable";
import gqlAbstract from "../../queries/gqlAbstract";
import { fatalityGridTableColumns } from "./fatalityGridTableParameters";

// Our initial query configuration
let queryConf = {
  options: {
    useQuery: {
      fetchPolicy: "no-cache",
    },
  },
  table: "view_fatalities",
  single_item: "crashes",
  showDateRange: true,
  columns: fatalityGridTableColumns,
  order_by: {},
  where: {},
  limit: 25,
  offset: 0,
};

const minDate = subYears(new Date(), 10);

const fatalitiesQuery = new gqlAbstract(queryConf);

const Fatalities = () => {
  return (
    <GridTable query={fatalitiesQuery} title={"Fatalities"} minDate={minDate} />
  );
};

export default withApollo(Fatalities);
