import React, { useState } from "react";
import LocationMap from "./LocationMap";
import LocationEditMap from "./LocationEditMap";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  ButtonGroup,
  Badge,
  Alert,
} from "reactstrap";

import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import palette from "google-palette";
import { Doughnut, HorizontalBar } from "react-chartjs-2";

import locationDataMap from "./locationDataMap";
import LocationCrashes from "./LocationCrashes";
import Widget02 from "../Widgets/Widget02";

import { colors } from "../../styles/colors";
import { GET_LOCATION } from "../../queries/Locations";
import {
  formatCostToDollars,
  formatDateTimeString,
} from "../../helpers/format";

function Location(props) {
  const locationId = props.match.params.id;
  const [mapSelected, setMapSelected] = useState("aerial");
  const { loading, error, data, refetch } = useQuery(GET_LOCATION, {
    variables: { id: locationId },
  });

  const handleMapChange = e => {
    e.preventDefault();
    setMapSelected(e.target.id);
  };

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const getAggregatePersonsSum = (data, field) => {
    // Display APD confirmed death count if one exists
    if (
      field === "apd_confirmed_death_count" &&
      data.atd_txdot_crashes_aggregate.aggregate.sum[field]
    ) {
      return `${data.atd_txdot_crashes_aggregate.aggregate.sum[field]}`;
    }
    // Display 0 if no APD confiemd death count exists
    else if (
      field === "apd_confirmed_death_count" &&
      !data.atd_txdot_crashes_aggregate.aggregate.sum[field]
    ) {
      return "0";
      // Return aggregated sum from Person and Primary Person tables for other fields
    } else {
      return `${data.atd_txdot_primaryperson_aggregate.aggregate.sum[field] +
        data.atd_txdot_person_aggregate.aggregate.sum[field]}`;
    }
  };

  const formatLabel = str => {
    let sections = [];

    // Get the approximate midpoint of the string
    let splitPoint = Math.floor(str.length / 2);

    // If the midpoint is not a space,
    // find the closest " " to the left of the midpoint
    // and split there instead
    if (str.charAt(splitPoint) !== " ") {
      splitPoint = str.substring(0, splitPoint).lastIndexOf(" ");
    }

    sections.push(str.substring(0, splitPoint));
    sections.push(str.substring(splitPoint));

    return sections;
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

  const horizontalBar = {
    labels: data.atd_txdot_locations[0].crashes_by_manner_collision
      .map((a, index) => `${index + 1}. ${a.collsn_desc}`)
      .map(a => formatLabel(a)),
    datasets: [
      {
        label: "Number of Collisions",
        backgroundColor: colors.success,
        borderColor: colors.grey200,
        borderWidth: 1,
        hoverBackgroundColor: colors.darkgreen,
        hoverBorderColor: colors.grey700,
        data: data.atd_txdot_locations[0].crashes_by_manner_collision.map(
          a => a.count
        ),
      },
    ],
  };

  const { count: crashCount } = data.atd_txdot_crashes_aggregate.aggregate;

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <h2 className="h2 mb-3">{data.atd_txdot_locations[0].description}</h2>
        </Col>
      </Row>
      {data && (
        <>
          <Row>
            <Col xs="12" sm="6" md="4">
              <Widget02
                header={getAggregatePersonsSum(
                  data,
                  "apd_confirmed_death_count"
                )}
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
                header={`${crashCount}`}
                mainText="Total Crashes"
                icon="fa fa-cab"
                color="success"
              />
            </Col>
            <Col xs="12" sm="6" md="4">
              <Widget02
                header={`${data.atd_txdot_primaryperson_aggregate.aggregate
                  .count + data.atd_txdot_person_aggregate.aggregate.count}`}
                mainText="Total People (Primary + Non-Primary)"
                icon="fa fa-user"
                color="dark"
              />
            </Col>
            <Col xs="12" sm="6" md="4">
              <Widget02
                header={`${data.atd_txdot_units_aggregate.aggregate.count}`}
                mainText="Total Units"
                icon="fa fa-car"
                color="secondary"
              />
            </Col>
          </Row>
        </>
      )}
      <Row>
        <Col md="6">
          <Card>
            <CardHeader>
              <i className="fa fa-map fa-lg mt-3"></i> View or Edit Location
              <ButtonGroup className="float-right">
                <Button
                  active={mapSelected === "aerial"}
                  id="aerial"
                  onClick={handleMapChange}
                  color="dark"
                  outline
                >
                  Aerial Map
                </Button>
                <Button
                  active={mapSelected === "edit"}
                  id="edit"
                  onClick={handleMapChange}
                  color="dark"
                  outline
                >
                  Edit Polygon
                </Button>
              </ButtonGroup>
            </CardHeader>
            <CardBody>
              {data && mapSelected === "aerial" && <LocationMap data={data} />}
              {data && mapSelected === "edit" && (
                <LocationEditMap data={data} refetch={refetch} />
              )}
            </CardBody>
          </Card>
          {locationDataMap.map(section => {
            return (
              <Card key={section.title}>
                <CardHeader>{section.title}</CardHeader>
                <CardBody>
                  <Table responsive striped hover>
                    <tbody>
                      {Object.keys(section.fields).map((field, i) => {
                        const fieldConfigObject = section.fields[field];
                        const fieldLabel = fieldConfigObject.label;
                        let fieldValueDisplay = "";

                        switch (field) {
                          // TODO: figure out a better way to parse through nested values
                          case "est_comp_cost":
                            fieldValueDisplay = !!data.atd_txdot_locations[0]
                              .crashes_count_cost_summary
                              ? data.atd_txdot_locations[0].crashes_count_cost_summary.est_comp_cost.toLocaleString()
                              : "0";
                            break;
                          default:
                            fieldValueDisplay =
                              data.atd_txdot_locations[0][field];
                        }

                        if (fieldConfigObject.format === "datetime") {
                          fieldValueDisplay = formatDateTimeString(
                            fieldValueDisplay
                          );
                        }

                        if (fieldConfigObject.format === "dollars") {
                          fieldValueDisplay = formatCostToDollars(
                            fieldValueDisplay
                          );
                        }

                        return (
                          <tr key={i}>
                            <td>
                              <strong>{fieldLabel}</strong>
                            </td>
                            <td>{fieldValueDisplay}</td>
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
        <Col md="6">
          <Card>
            <CardHeader>Types of Vehicles - Count Distribution</CardHeader>
            <CardBody>
              {crashCount === 0 && (
                <Alert color="warning">
                  No crashes at this particular location
                </Alert>
              )}

              {crashCount > 0 && (
                <div className="chart-wrapper" style={{ padding: "1.5rem 0" }}>
                  <Badge
                    color="dark"
                    className="float-right"
                    style={{ padding: "4px" }}
                  >
                    <i className="fa fa-mouse-pointer" />
                    &nbsp; Click On Labels
                  </Badge>
                  <Doughnut data={doughnut} />
                </div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Manner of Collisions - Most Frequent</CardHeader>
            <CardBody>
              {crashCount === 0 && (
                <Alert color="warning">
                  No crashes at this particular location
                </Alert>
              )}

              {crashCount > 0 && (
                <div className="chart-wrapper" style={{ padding: "1.5rem 0" }}>
                  <HorizontalBar
                    data={horizontalBar}
                    options={{
                      scales: {
                        xAxes: [
                          {
                            ticks: {
                              beginAtZero: true,
                              precision: 0,
                            },
                          },
                        ],
                      },
                    }}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <LocationCrashes locationId={locationId} />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Location);
