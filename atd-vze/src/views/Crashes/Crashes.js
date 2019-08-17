import React from "react";
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { withApollo } from "react-apollo";
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

// TODO decide what fields to search? dropdown with column names? Search all?
const SEARCH_CRASHES = gql`
  query($searchValue: String) {
    atd_txdot_crashes(
      limit: 100
      where: { rpt_street_name: { _like: $searchValue } }
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
  "Crash Id",
  "Crash Date",
  "Address",
  "Total Injury Count",
  "Death Count"
];

function Crashes() {
  const { loading, error, data } = useQuery(GET_CRASHES);
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <i className="fa fa-car" /> Crashes
            </CardHeader>
            <CardBody>
              <TableSearchBar query={SEARCH_CRASHES} />
              <Table responsive>
                <thead>
                  <tr>
                    {columns.map((col, i) => (
                      <th key={`th-${i}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
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
