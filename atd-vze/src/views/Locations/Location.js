import React, { useState, useEffect } from "react";
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
import { useQuery, useLazyQuery } from "@apollo/react-hooks";
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
import LocationDashboard from "./LocationDashboard";

function Location(props) {
  const locationId = props.match.params.id;
  const [mapSelected, setMapSelected] = useState("aerial");
  const [aggregateQuery, setAggregateQuery] = useState(null);
  const { loading, error, data, refetch } = useQuery(GET_LOCATION, {
    variables: { id: locationId },
  });
  const [loadAggData, { loading: aggLoading, data: aggData }] = useLazyQuery(
    aggregateQuery
  );

  useEffect(() => {
    aggregateQuery && loadAggData();
    console.log(aggData);
  }, [aggregateQuery]);

  const handleMapChange = e => {
    e.preventDefault();
    setMapSelected(e.target.id);
  };

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

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

  const getTableQuery = query => {
    // Define aggregates needed for widgets
    const aggregateQueryConfigs = [
      {
        table: "atd_txdot_crashes_aggregate",
        columns: [`count`, `sum { apd_confirmed_death_count }`],
      },
      {
        table: "atd_txdot_primaryperson_aggregate",
        columns: [
          `count`,
          `sum { sus_serious_injry_cnt
                 years_of_life_lost }`,
        ],
        key: "crash",
      },
      {
        table: "atd_txdot_person_aggregate",
        columns: [
          `count`,
          `sum { sus_serious_injry_cnt
                 years_of_life_lost }`,
        ],
        key: "crash",
      },
      {
        table: "atd_txdot_units_aggregate",
        columns: [`count`],
        key: "crash",
      },
    ];

    // Generate GraphQL query from config array
    const aggregatesQuery = query.queryAggregate(aggregateQueryConfigs, query);

    // Set state to execute GraphQL query
    setAggregateQuery(aggregatesQuery);
  };

  const getAggregateData = field => {
    // If aggData is populated, use switch to return aggregate data
    if (aggData !== undefined && Object.keys(aggData).length > 0) {
      // In switch, using field in object reference if possible
      switch (field) {
        case "apd_confirmed_death_count":
          return aggData.atd_txdot_crashes_aggregate.aggregate.sum[field];
        case "sus_serious_injry_cnt":
          return (
            aggData.atd_txdot_primaryperson_aggregate.aggregate.sum
              .sus_serious_injry_cnt +
            aggData.atd_txdot_person_aggregate.aggregate.sum
              .sus_serious_injry_cnt
          );
        case "years_of_life_lost":
          return (
            aggData.atd_txdot_primaryperson_aggregate.aggregate.sum[field] +
            aggData.atd_txdot_person_aggregate.aggregate.sum[field]
          );
        case "count":
          return aggData.atd_txdot_crashes_aggregate.aggregate[field];
        case "total_people":
          return (
            aggData.atd_txdot_primaryperson_aggregate.aggregate.count +
            aggData.atd_txdot_person_aggregate.aggregate.count
          );
        case "total_units":
          return aggData.atd_txdot_units_aggregate.aggregate.count;
        default:
          console.log("no match");
      }
    } else {
      return "0";
    }
  };

  const { count: crashCount } = data.atd_txdot_crashes_aggregate.aggregate;

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <h2 className="h2 mb-3">{data.atd_txdot_locations[0].description}</h2>
        </Col>
      </Row>
      <LocationDashboard getAggregateData={getAggregateData} />
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
                              : "No data";
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
          <LocationCrashes
            locationId={locationId}
            getTableQuery={getTableQuery}
          />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Location);
