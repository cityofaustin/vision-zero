import React, { useState } from "react";
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
      order_by: { ORDER_BY }
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
  const { loading, error, data } = useQuery(GET_CRASHES);
  const [sortColumn, setSortColumn] = useState("crash_id");
  const [sortOrder, setSortOrder] = useState("asc");
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const handleTableHeaderClick = col => {
    console.log("You clicky the text", col);
    sortOrder === "desc" ? setSortOrder("asc") : setSortOrder("asc");
    setSortColumn(col);
  };

  const convertFieldNameToTitle = col => {
    let title = "";
    crashDataMap.map(field => {
      title = field.fields[col] ? field.fields[col] : title;
    });
    return title;
  };

  const addSortToQuery = () => {
    let queryWithSort = SORT_CRASHES.replace(
      "ORDER_BY",
      `${sortColumn}: ${sortOrder}`
    );
    return gql`
      ${queryWithSort}
    `;
  }
  const [tableData, setTableData] = useState("");
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const { loading, error, data } = useQuery(GET_CRASHES, {
    onCompleted: !hasSearchResults && (data => setTableData(data)),
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const updateCrashTableData = (data, hasSearchResults) => {
    setHasSearchResults(hasSearchResults);
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
                        {convertFieldNameToTitle(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
<<<<<<< HEAD
                  {data.atd_txdot_crashes.map(crash => (
                    <tr key={crash.crash_id}>
                      <td>
                        <Link to={`crashes/${crash.crash_id}`}>
                          {crash.crash_id}
                        </Link>
                      </td>
                      <td>{crash.crash_date}</td>
                      <td>{`${crash.rpt_street_pfx} ${crash.rpt_street_name} ${
                        crash.rpt_street_sfx
                      }`}</td>
                      <td>
                        <Badge color="warning">{crash.tot_injry_cnt}</Badge>
                      </td>
                      <td>
                        <Badge color="danger">{crash.death_cnt}</Badge>
                      </td>
                    </tr>
                  ))}
=======
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
>>>>>>> 3f3debd0e52d2830b49b378cbf89ede15dbc98aa
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
