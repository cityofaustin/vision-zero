import React, { useState, useEffect } from "react";

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  Badge,
} from "reactstrap";

import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import palette from "google-palette";

import locationDataMap from "./locationDataMap";
import LocationCrashes from "./LocationCrashes";

import { GET_LOCATION } from "../../queries/Locations";
import Widget02 from "../Widgets/Widget02";
import { Doughnut } from "react-chartjs-2";
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";

function Location(props) {
  const locationId = props.match.params.id;
  const { loading, error, data } = useQuery(GET_LOCATION, {
    variables: { id: locationId },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const getAggregatePersonsSum = (data, field) => {
    return (
      data.atd_txdot_primaryperson_aggregate.aggregate.sum[field] +
      data.atd_txdot_person_aggregate.aggregate.sum[field]
    );
  };

  const vehBodyGraphConfig = {
    palette: palette(
      "mpn65",
      data.atd_txdot_locations[0].crashes_by_veh_body_style.length
    ).map(a => `#${a}`),
    labels: data.atd_txdot_locations[0].crashes_by_veh_body_style.map(
      a => a.veh_body_styl_desc
    ),
    data: data.atd_txdot_locations[0].crashes_by_veh_body_style.map(
      a => a.count
    ),
  };

  const doughnut = {
    labels: vehBodyGraphConfig.labels,
    datasets: [
      {
        data: vehBodyGraphConfig.data,
        backgroundColor: vehBodyGraphConfig.palette,
        hoverBackgroundColor: ["#000"],
      },
    ],
  };

  return (
    <div className="animated fadeIn">
      {data && (
        <Row>
          <Col xs="12" sm="6" md="4">
            <Widget02
              header={getAggregatePersonsSum(data, "death_cnt")}
              mainText="Fatalities"
              icon="fa fa-heartbeat"
              color="danger"
            />
          </Col>
          <Col xs="12" sm="6" md="4">
            <Widget02
              header={getAggregatePersonsSum(data, "sus_serious_injry_cnt")}
              mainText="Serious Injuries"
              icon="fa fa-medkit"
              color="warning"
            />
          </Col>
          <Col xs="12" sm="6" md="4">
            <Widget02
              header={getAggregatePersonsSum(data, "years_of_life_lost")}
              mainText="Years of Life Lost"
              icon="fa fa-hourglass-end"
              color="info"
            />
          </Col>
          <Col xs="12" sm="6" md="4">
            <Widget02
              header={
                data.atd_txdot_primaryperson_aggregate.aggregate.count +
                data.atd_txdot_person_aggregate.aggregate.count
              }
              mainText="Total People (Primary + Non-Primary)"
              icon="fa fa-user"
              color="dark"
            />
          </Col>
          <Col xs="12" sm="6" md="4">
            <Widget02
              header={data.atd_txdot_units_aggregate.aggregate.count}
              mainText="Total Units"
              icon="fa fa-car"
              color="secondary"
            />
          </Col>
          <Col xs="12" sm="6" md="4">
            <Widget02
              header={data.atd_txdot_crashes_aggregate.aggregate.count}
              mainText="Total Crashes"
              icon="fa fa-cab"
              color="success"
            />
          </Col>
        </Row>
      )}
      <Row>
        <Col lg={6}>
          {locationDataMap.map(section => {
            return (
              <Card key={section.title}>
                <CardHeader>{section.title}</CardHeader>
                <CardBody>
                  <Table responsive striped hover>
                    <tbody>
                      {Object.keys(section.fields).map((field, i) => {
                        return (
                          <tr key={i}>
                            <td>{`${section.fields[field]}:`}</td>
                            <td>
                              <strong>
                                {data.atd_txdot_locations[0][field]}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            );
          })}
        </Col>

        <Col lg={6}>
          <Card>
            <CardHeader>Types of Vehicles - Count Distribution</CardHeader>
            <CardBody>
              <div className="chart-wrapper" style={{ padding: "2rem 0" }}>
                <Badge
                  color="dark"
                  className="float-right"
                  style={{ padding: "4px" }}
                >
                  <i class="fa fa-mouse-pointer" />
                  &nbsp; Click On Labels
                </Badge>
                <Doughnut data={doughnut} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <LocationCrashes locationId={locationId} />
    </div>
  );
}

export default withApollo(Location);
