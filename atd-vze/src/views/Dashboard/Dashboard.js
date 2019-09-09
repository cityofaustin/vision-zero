import React from "react";
import { Col, Row } from "reactstrap";

import Widget02 from "../Widgets/Widget02";
import { GET_CRASH } from "../../queries/dashboard";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

function Dashboard() {
  const year = (new Date()).getFullYear();
  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`
  const { loading, error, data } = useQuery(GET_CRASH, {
    variables: { yearStart, yearEnd }
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const crashesYTD = data.atd_txdot_crashes_aggregate.aggregate.count;
  const fatalitiesArray = data.atd_txdot_crashes;
  let deathCount = 0;

  fatalitiesArray.forEach(function(crash) {
    deathCount += crash.death_cnt
  });
  
  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={crashesYTD + ""}
            mainText={"Crashes in " + year}
            icon="fa fa-car"
            color="warning"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={deathCount + ""}
            mainText={"Deaths in " + year}
            icon="fa fa-heartbeat"
            color="danger"
          />
        </Col>
        {/* <Col xs="12" sm="6" md="4">
          <Widget02
            header={""}
            mainText="Years of Life Lost in 2019"
            icon="fa fa-medkit"
            color="info"
          />
        </Col> */}
        {/* <Col xs="12" sm="6" md="4">
          <Widget02
            header={""}
            mainText="Years of Life Lost in 2019"
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col> */}
      </Row>
    </div>
  );
}

export default withApollo(Dashboard);
