import React from "react";
import { Col, Row } from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import Widget02 from "../Widgets/Widget02";

import { GET_CRASH } from "../../queries/dashboard";

function VZDashboard() {
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const { loading, error, data } = useQuery(GET_CRASH, {
    variables: { yearStart, yearEnd },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const yearsOfLifeLostYTD =
    data.atd_txdot_primaryperson_aggregate.aggregate.sum.years_of_life_lost +
    data.atd_txdot_person_aggregate.aggregate.sum.years_of_life_lost;
  const fatalitiesYTD =
    data.atd_txdot_crashes_aggregate.aggregate.sum.death_cnt;
  const seriousInjuriesYTD =
    data.atd_txdot_crashes_aggregate.aggregate.sum.sus_serious_injry_cnt;
  const crashesYTD = data.atd_txdot_crashes_aggregate.aggregate.count;

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={yearsOfLifeLostYTD + ""}
            mainText={"Years of life lost in " + year}
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={fatalitiesYTD + ""}
            mainText={"Fatalities in " + year}
            icon="fa fa-heartbeat"
            color="danger"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={seriousInjuriesYTD + ""}
            mainText={"Serious injuries in " + year}
            icon="fa fa-medkit"
            color="info"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={crashesYTD + ""}
            mainText={"Crashes in " + year}
            icon="fa fa-car"
            color="warning"
          />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(VZDashboard);