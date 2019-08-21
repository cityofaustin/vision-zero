import React, { useState } from "react";
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { withApollo } from "react-apollo";
import { CSVLink } from "react-csv";
import TableSearchBar from "../../Components/TableSearchBar";
import TableSortHeader from "../../Components/TableSortHeader";
import crashDataMap from "./crashDataMap";
import TablePaginationControl from "../../Components/TablePaginationControl";

const dataKey = "atd_txdot_crashes";

const GET_CRASHES = gql`
  {
    atd_txdot_crashes(
      limit: 100
      where: { crash_fatal_fl: { _eq: "Y" } }
      order_by: { crash_date: desc }
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

const SORT_CRASHES = `
  {
    atd_txdot_crashes(
      limit: 100
      where: { crash_fatal_fl: { _eq: "Y" } }
      ORDER_BY
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

// TODO decide what fields to search? dropdown with column names? Search all?
const SEARCH_CRASHES = `
  query {
    atd_txdot_crashes(
      limit: 100
      FILTER
      order_by: { crash_date: desc }
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

const PAGE_CRASHES = `
  {
    atd_txdot_crashes(
      LIMIT
      OFFSET
      where: { crash_fatal_fl: { _eq: "Y" } }
      order_by: { crash_date: desc }
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

function Crashes() {
  const [tableData, setTableData] = useState("");
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [hasSortOrder, setHasSortOrder] = useState(false);

  const { loading, error, data } = useQuery(GET_CRASHES, {
    onCompleted:
      !hasSearchResults && !hasSortOrder && (data => setTableData(data)),
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const updateSearchCrashTableData = (data, hasSearchResults) => {
    setHasSearchResults(hasSearchResults);
    setTableData(data);
    // Use Search Clear button to clear sort order as well/show unfiltered query data
    setHasSortOrder(false);
  };

  const updateSortCrashTableData = (data, hasSortOrder) => {
    setHasSortOrder(hasSortOrder);
    setTableData(data);
  };

  const updatePageCrashTableData = data => {
    setTableData(data);
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <i className="fa fa-car" /> Crashes
            </CardHeader>
            {/* TODO Float icon right and format data in filename */}
            <CSVLink
              className="mt-2 mr-2 float-right"
              data={tableData && tableData[dataKey]}
              filename={dataKey + Date.now()}
            >
              <i className="fa fa-save fa-2x" /> Export .csv
            </CSVLink>
            <CardBody>
              <TableSearchBar
                queryString={SEARCH_CRASHES}
                updateResults={updateSearchCrashTableData}
                hasSearchResults={setHasSearchResults}
              />
              <TablePaginationControl
                queryString={PAGE_CRASHES}
                updateResults={updatePageCrashTableData}
                responseDataSet={"atd_txdot_crashes"}
              />
              <Table responsive>
                <TableSortHeader
                  queryString={SORT_CRASHES}
                  columns={columns}
                  updateTableData={updateSortCrashTableData}
                  fieldMap={crashDataMap}
                  hasSortOrder={hasSortOrder}
                />
                <tbody>
                  {tableData &&
                    tableData[dataKey].map(crash => (
                      <tr key={crash.crash_id}>
                        <td>
                          <Link to={`crashes/${crash.crash_id}`}>
                            {crash.crash_id}
                          </Link>
                        </td>
                        <td>{crash.crash_date}</td>
                        <td>{`${crash.rpt_street_pfx} ${crash.rpt_street_name} ${crash.rpt_street_sfx}`}</td>
                        <td>
                          <Badge color="warning">{crash.tot_injry_cnt}</Badge>
                        </td>
                        <td>
                          <Badge color="danger">{crash.death_cnt}</Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Crashes);
