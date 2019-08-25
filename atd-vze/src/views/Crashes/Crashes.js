import React, { useState, useEffect } from "react";
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

// TODO decide what fields to search? Search all?
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
      ORDER_BY
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

const columns = [
  "crash_id",
  "crash_date",
  "rpt_street_name",
  "tot_injry_cnt",
  "death_cnt",
];

function Crashes() {
  const [tableQuery, setTableQuery] = useState(GET_CRASHES);
  const [pageFilter, setPageFilter] = useState("");
  const [orderFilter, setOrderFilter] = useState("");

  useEffect(() => {
    const removeFiltersNotSet = queryWithFilters => {
      let queryWithFiltersCleared = queryWithFilters;
      if (pageFilter === "") {
        queryWithFiltersCleared = queryWithFiltersCleared.replace("OFFSET", "");
        queryWithFiltersCleared = queryWithFiltersCleared.replace("LIMIT", "");
      }
      if (orderFilter === "") {
        queryWithFiltersCleared = queryWithFiltersCleared.replace(
          "ORDER_BY",
          ""
        );
      }
      return queryWithFiltersCleared;
    };
    const createQuery = () => {
      let queryWithFilters = FILTER_CRASHES;
      queryWithFilters = removeFiltersNotSet(queryWithFilters);
      if (pageFilter === "" && orderFilter === "") {
        setTableQuery(GET_CRASHES);
      } else {
        if (pageFilter !== "") {
          pageFilter.forEach(query => {
            queryWithFilters = queryWithFilters.replace(
              Object.keys(query),
              Object.values(query)
            );
          });
        }
        if (orderFilter !== "") {
          orderFilter.forEach(query => {
            queryWithFilters = queryWithFilters.replace(
              Object.keys(query),
              Object.values(query)
            );
          });
        }
        setTableQuery(queryWithFilters);
      }
    };
    createQuery();
  }, [pageFilter, orderFilter]);

  const { loading, error, data } = useQuery(
    gql`
      ${tableQuery}
    `
  );

  if (error) return `Error! ${error.message}`;

  const updateSearchCrashTableData = data => {
    // data[dataKey] && setHasSearchFilter(true);
    // data[dataKey] && setTableData(data);
  };

  const clearFilters = () => {
    setPageFilter("");
    setOrderFilter("");
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
                  responseDataSet={"atd_txdot_crashes"}
                  setPageFilter={setPageFilter}
                />{" "}
                {data[dataKey] && (
                  <CSVLink
                    className=""
                    data={data[dataKey]}
                    filename={dataKey + Date.now()}
                  >
                    <i className="fa fa-save fa-2x ml-2 mt-1" />
                  </CSVLink>
                )}
              </ButtonGroup>
              <Table responsive>
                <TableSortHeader
                  columns={columns}
                  setOrderFilter={setOrderFilter}
                  fieldMap={crashDataMap}
                />
                <tbody>
                  {loading ? (
                    <Spinner className="mt-2" color="primary" />
                  ) : (
                    data &&
                    data[dataKey].map(crash => (
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
