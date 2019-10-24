import React from "react";
import get from "lodash.get";

import { Col, Badge, Alert, Card, CardHeader, CardBody } from "reactstrap";
import palette from "google-palette";
import { Doughnut, HorizontalBar } from "react-chartjs-2";
import { colors } from "../styles/colors";

const GridTableCharts = ({ chartData, chartConfig }) => {
  const recordCount = get(chartData, chartConfig.totalRecordsPath);

  const getChartData = config => {
    return config.labels.map(type => {
      let typeTotal = 0;
      chartData[config.table].forEach(record => {
        if (config.isSingleRecord) {
          if (record[config.nestedKey][config.nestedPath] === type) {
            typeTotal++;
          }
        } else {
          record[config.nestedKey].forEach(unit => {
            if (get(unit, config.nestedPath) === type) {
              typeTotal++;
            }
          });
        }
      });
      return typeTotal;
    });
  };

  const vehBodyGraphConfig = {
    palette: palette("mpn65", chartConfig.doughnutChart.labels.length).map(
      a => `#${a}`
    ),
    labels: chartConfig.doughnutChart.labels.map(a => a),
    data: getChartData(chartConfig.doughnutChart),
  };

  const doughnut = {
    labels: vehBodyGraphConfig.labels,
    datasets: [
      {
        data: getChartData(chartConfig.doughnutChart),
        backgroundColor: vehBodyGraphConfig.palette,
        hoverBackgroundColor: ["#000"],
      },
    ],
  };

  const horizontalBar = {
    labels: chartConfig.horizontalBarChart.labels,
    datasets: [
      {
        label: chartConfig.horizontalBarChart.title,
        backgroundColor: colors.success,
        borderColor: colors.grey200,
        borderWidth: 1,
        hoverBackgroundColor: colors.darkgreen,
        hoverBorderColor: colors.grey700,
        data: getChartData(chartConfig.horizontalBarChart),
      },
    ],
  };

  const renderAlert = () => (
    <Alert color="warning">No crashes at this particular location</Alert>
  );

  return (
    <Col>
      <Card>
        <CardHeader>Types of Vehicles - Count Distribution</CardHeader>
        <CardBody>
          {(recordCount === 0 && renderAlert()) || (
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
          {(recordCount === 0 && renderAlert()) || (
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
