import React from "react";
import { Badge, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { withApollo } from "react-apollo";
import crashDataMap from "./crashDataMap";

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
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const handleTableHeaderClick = () => {
    console.log("You clicky the text");
  };

  const convertFieldNameToTitle = col => {
    let title = "";
    crashDataMap.map(field => {
      title = field.fields[col] ? field.fields[col] : title;
    });
    return title;
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
              <Table responsive>
                <thead>
                  <tr>
                    {columns.map((col, i) => (
                      <th onClick={handleTableHeaderClick} key={`th-${i}`}>
                        {convertFieldNameToTitle(col)}
                      </th>
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
