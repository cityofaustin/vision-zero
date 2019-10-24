import React from "react";

import { Col, Badge, Alert, Card, CardHeader, CardBody } from "reactstrap";
import palette from "google-palette";
import { Doughnut, HorizontalBar } from "react-chartjs-2";
import { colors } from "../styles/colors";

const GridTableCharts = ({ aggData, data }) => {
  const { count: crashCount } = aggData.atd_txdot_crashes_aggregate.aggregate;

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

  return (
    <Col>
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
  );
};

export default GridTableCharts;
