import React, { useState, useEffect } from "react";
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { withApollo } from "react-apollo";
import crashDataMap from "./crashDataMap";
import TableSearchBar from "../../Components/TableSearchBar";

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

const columns = [
  "crash_id",
  "crash_date",
  "rpt_street_name",
  "tot_injry_cnt",
  "death_cnt",
];

function Crashes() {
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const handleTableHeaderClick = col => {
    if (sortOrder === "" && sortColumn === "") {
      // First time sort is applied
      setSortOrder("asc");
      setSortColumn(col);
    } else if (sortColumn === col) {
      // Repeat sort on column
      sortOrder === "desc" ? setSortOrder("asc") : setSortOrder("desc");
    } else if (sortColumn !== col) {
      // Sort different column after initial sort
      setSortOrder("desc");
      setSortColumn(col);
    }
    setTableData(sortData);
  };

  const convertFieldNameToTitle = col => {
    let title = "";
    crashDataMap.map(field => {
      title = field.fields[col] ? field.fields[col] : title;
    });
    return title;
  };

  const addSortToQuery = () => {
    let queryWithSort =
      sortColumn !== ""
        ? SORT_CRASHES.replace(
            "ORDER_BY",
            `order_by: { ${sortColumn}: ${sortOrder} }`
          )
        : SORT_CRASHES.replace("ORDER_BY", "");
    return gql`
      ${queryWithSort}
    `;
  };

  const [tableData, setTableData] = useState("");
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const { loading, error, data } = useQuery(GET_CRASHES, {
    onCompleted:
      !hasSearchResults && sortOrder === "" && (data => setTableData(data)),
  });

  const { loading: sortLoading, error: sortError, data: sortData } = useQuery(
    addSortToQuery()
  );

  useEffect(() => {
    setTableData(sortData);
  }, [sortData]);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const updateCrashTableData = (data, hasSearchResults) => {
    setHasSearchResults(hasSearchResults);
    setTableData(data);
  };

  // Add greyed-out arrow to indicate that sort is possible
  const renderSortArrow = col =>
    sortColumn === col ? (
      <i
        className={`fa fa-arrow-circle-${sortOrder === "asc" ? "up" : "down"}`}
      />
    ) : null;

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
                updateResults={updateCrashTableData}
                hasSearchResults={setHasSearchResults}
              />
              <Table responsive>
                <thead>
                  <tr>
                    {columns.map((col, i) => (
                      <th
                        onClick={e => handleTableHeaderClick(col)}
                        key={`th-${i}`}
                      >
                        {renderSortArrow(col)} {convertFieldNameToTitle(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData &&
                    tableData.atd_txdot_crashes.map(crash => (
                      <tr key={crash.crash_id}>
                        <td>
                          <Link to={`crashes/${crash.crash_id}`}>
                            {crash.crash_id}
                          </Link>
                        </td>
                        <td>{crash.crash_date}</td>
                        <td>{`${crash.rpt_street_pfx} ${
                          crash.rpt_street_name
                        } ${crash.rpt_street_sfx}`}</td>
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
