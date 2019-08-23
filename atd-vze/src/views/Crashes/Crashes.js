import React, { useState } from "react";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  ButtonGroup,
  Spinner,
} from "reactstrap";
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
      offset: 0
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

const FILTER_CRASHES = `
  {
    atd_txdot_crashes(
      OFFSET
      LIMIT
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
  const [tableQuery, setTableQuery] = useState(GET_CRASHES);
  const [hasSearchFilter, setHasSearchFilter] = useState(false);
  const [hasSortFilter, setHasSortFilter] = useState(false);
  const [hasPageFilter, setHasPageFilter] = useState(false);

  const createQuery = queryStringArray => {
    if (!hasPageFilter && typeof queryStringArray === "undefined") {
      setTableQuery(GET_CRASHES);
    } else if (!hasPageFilter && typeof queryStringArray !== "undefined") {
      setHasPageFilter(true);
      let queryWithPage = FILTER_CRASHES;
      queryStringArray.forEach(query => {
        queryWithPage = queryWithPage.replace(
          Object.keys(query),
          Object.values(query)
        );
      });
      const query = gql`
        ${queryWithPage}
      `;
      setTableQuery(query);
    } else if (hasPageFilter && typeof queryStringArray !== "undefined") {
      let queryWithPage = FILTER_CRASHES;
      queryStringArray.forEach(query => {
        queryWithPage = queryWithPage.replace(
          Object.keys(query),
          Object.values(query)
        );
      });
      const query = gql`
        ${queryWithPage}
      `;
      setTableQuery(query);
    }
  };

  const { loading, error, data } = useQuery(tableQuery, {
    onCompleted: data => setTableData(data),
  });

  if (error) return `Error! ${error.message}`;

  const updateSearchCrashTableData = data => {
    // data[dataKey] && setHasSearchFilter(true);
    // data[dataKey] && setTableData(data);
  };

  const updateSortCrashTableData = data => {
    // data[dataKey] && setHasSortFilter(true);
    // data[dataKey] && setTableData(data);
  };

  const updatePageCrashTableData = data => {
    data[dataKey] && setHasPageFilter(true);
    data[dataKey] && setTableData(data);
  };

  const clearFilters = () => {
    setHasSearchFilter(false);
    setHasSortFilter(false);
    setHasPageFilter(false);
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <i className="fa fa-car" /> Crashes
            </CardHeader>
            <CardBody>
              <TableSearchBar
                queryString={SEARCH_CRASHES}
                updateResults={updateSearchCrashTableData}
                clearFilters={clearFilters}
              />
              <ButtonGroup className="mb-2 float-right">
                <TablePaginationControl
                  queryString={FILTER_CRASHES}
                  updateResults={updatePageCrashTableData}
                  responseDataSet={"atd_txdot_crashes"}
                  createQuery={createQuery}
                />{" "}
                <CSVLink
                  className=""
                  data={tableData && tableData[dataKey]}
                  filename={dataKey + Date.now()}
                >
                  <i className="fa fa-save fa-2x ml-2 mt-1" />
                </CSVLink>
              </ButtonGroup>
              <Table responsive>
                <TableSortHeader
                  queryString={SORT_CRASHES}
                  columns={columns}
                  updateTableData={updateSortCrashTableData}
                  fieldMap={crashDataMap}
                />
                <tbody>
                  {loading ? (
                    <Spinner className="mt-2" color="primary" />
                  ) : (
                    tableData &&
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
                    ))
                  )}
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
