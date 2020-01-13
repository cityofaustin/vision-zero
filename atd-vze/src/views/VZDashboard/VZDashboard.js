import React from "react";
import { Col, Row } from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import Widget02 from "../Widgets/Widget02";

import { GET_CRASHES_YTD } from "../../queries/dashboard";

function VZDashboard() {
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const { loading, error, data } = useQuery(GET_CRASHES_YTD, {
    variables: { yearStart, yearEnd },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const {
    years_of_life_lost: yearsOfLifeLostPrimaryPerson,
  } = data.atd_txdot_primaryperson_aggregate.aggregate.sum;
  const {
    years_of_life_lost: yearsOfLifeLostPerson,
  } = data.atd_txdot_person_aggregate.aggregate.sum;
  const {
    sus_serious_injry_cnt: seriousInjuryCount,
  } = data.seriousInjuriesAndTotal.aggregate.sum;
  const {
    apd_confirmed_death_count: deathCount,
  } = data.fatalities.aggregate.sum;

  const { count: crashesCount } = data.seriousInjuriesAndTotal.aggregate;

  const yearsOfLifeLostYTD =
    yearsOfLifeLostPrimaryPerson + yearsOfLifeLostPerson;
  const fatalitiesYTD = deathCount;
  const seriousInjuriesYTD = seriousInjuryCount;
  const crashesYTD = crashesCount;

  // Widget02 expects a string value, DB returns number or null
  const commaSeparator = number =>
    number === null ? "0" : number.toLocaleString();

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={commaSeparator(yearsOfLifeLostYTD)}
            mainText={`Years of life lost in ${year}`}
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={commaSeparator(fatalitiesYTD)}
            mainText={`Fatalities in ${year}`}
            icon="fa fa-heartbeat"
            color="danger"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={commaSeparator(seriousInjuriesYTD)}
            mainText={`Serious injuries in ${year}`}
            icon="fa fa-medkit"
            color="info"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={commaSeparator(crashesYTD)}
            mainText={`Crashes in ${year}`}
            icon="fa fa-car"
            color="warning"
          />
        </Col>
      </Row>
      <Row>
        <Col className="ml-1">
          {
            "*Dashboard data reflects APD confirmed deaths and excludes crashes on private driveways."
          }
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(VZDashboard);
