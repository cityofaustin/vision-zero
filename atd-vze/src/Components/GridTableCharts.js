import React, { useState } from "react";

import { Col, Badge, Alert, Card, CardHeader, CardBody } from "reactstrap";
import palette from "google-palette";
import { Doughnut, HorizontalBar } from "react-chartjs-2";
import { colors } from "../styles/colors";

const GridTableCharts = ({ chartData }) => {
  const collisionTypeArray = [
    "MOTOR VEHICLE",
    "TRAIN",
    "PEDALCYCLIST",
    "PEDESTRIAN",
    "MOTORIZED CONVEYANCE",
    "TOWED/PUSHED/TRAILER",
    "NON-CONTACT",
    "OTHER",
  ];

  const getMannerOfCollisions = () => {
    return collisionTypeArray.map(type => {
      let typeTotal = 0;
      chartData.atd_txdot_crashes.forEach(record => {
        record.units.forEach(unit => {
          if (unit.unit_description.veh_unit_desc_desc === type) {
            typeTotal++;
          }
        });
      });
      return typeTotal;
    });
  };

  const { count: crashCount } = chartData.atd_txdot_crashes_aggregate.aggregate;

  //   const formatLabel = str => {
  //     let sections = [];

  //     // Get the approximate midpoint of the string
  //     let splitPoint = Math.floor(str.length / 2);

  //     // If the midpoint is not a space,
  //     // find the closest " " to the left of the midpoint
  //     // and split there instead
  //     if (str.charAt(splitPoint) !== " ") {
  //       splitPoint = str.substring(0, splitPoint).lastIndexOf(" ");
  //     }

  //     sections.push(str.substring(0, splitPoint));
  //     sections.push(str.substring(splitPoint));

  //     return sections;
  //   };

  //   const vehBodyGraphConfig = {
  //     palette: palette(
  //       "mpn65",
  //       chartData.atd_txdot_locations[0].crashes_by_veh_body_style.length
  //     ).map(a => `#${a}`),
  //     labels: chartData.atd_txdot_locations[0].crashes_by_veh_body_style.map(
  //       a => a.veh_body_styl_desc
  //     ),
  //     data: chartData.atd_txdot_locations[0].crashes_by_veh_body_style.map(
  //       a => a.count
  //     ),
  //   };

  //   const doughnut = {
  //     labels: vehBodyGraphConfig.labels,
  //     datasets: [
  //       {
  //         data: vehBodyGraphConfig.data,
  //         backgroundColor: vehBodyGraphConfig.palette,
  //         hoverBackgroundColor: ["#000"],
  //       },
  //     ],
  //   };

  const horizontalBar = {
    labels: collisionTypeArray,
    datasets: [
      {
        label: "Number of Collisions",
        backgroundColor: colors.success,
        borderColor: colors.grey200,
        borderWidth: 1,
        hoverBackgroundColor: colors.darkgreen,
        hoverBorderColor: colors.grey700,
        data: getMannerOfCollisions(),
      },
    ],
  };

  return (
    <Col>
      {/* <Card>
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
      </Card> */}
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
