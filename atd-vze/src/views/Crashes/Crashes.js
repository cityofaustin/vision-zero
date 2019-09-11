import React from "react";
import { withApollo } from "react-apollo";
import TableWithFilters from "../../Components/TableWithFilters";
import crashDataMap from "./crashDataMap";

// Key for data response array from DB
const dataKey = "atd_txdot_crashes";

const GET_CRASHES = `
  {
    atd_txdot_crashes(
      offset: 0
      where: { crash_fatal_fl: { _eq: "Y" } }
    ) {
      crash_id
      death_cnt
      tot_injry_cnt
      crash_fatal_fl
      rpt_street_pfx
      rpt_street_sfx
      rpt_street_name
      crash_date
    }
  }
`;

const FILTER_CRASHES = `
  {
    atd_txdot_crashes(
      OFFSET
      LIMIT
      ORDER_BY
      SEARCH
    ) {
      crash_id
      death_cnt
      tot_injry_cnt
      crash_fatal_fl
      rpt_street_pfx
      rpt_street_sfx
      rpt_street_name
      crash_date
    }
  }
`;

const columns = [
  "crash_id",
  "crash_date",
  "rpt_street_name",
  "tot_injry_cnt",
  "death_cnt",
];

const fieldsToSearch = [
  { rpt_street_name: "Reported Street Name" },
  { crash_id: "Crash ID" },
];

const Crashes = () => (
  <TableWithFilters
    dataKey={dataKey}
    title={"Crashes"}
    defaultQuery={GET_CRASHES}
    filterQuery={FILTER_CRASHES}
    fieldsToSearch={fieldsToSearch}
    columns={columns}
    fieldMap={crashDataMap}
    databaseDateColumnName={"crash_date"}
  />
);

export default withApollo(Crashes);
