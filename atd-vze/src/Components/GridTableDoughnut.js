import React, { useState, useEffect } from "react";
import get from "lodash.get";
import { renderAlert } from "./gridTableHelpers";

import { Badge, Card, CardHeader, CardBody } from "reactstrap";
import palette from "google-palette";
import { Doughnut } from "react-chartjs-2";

const GridTableDoughnut = ({ chartData, chartConfig }) => {
  const recordCount = get(chartData, chartConfig.totalRecordsPath);

  const [doughnutData, setDoughnutData] = useState([]);
  const [doughnutLabels, setDoughnutLabels] = useState([]);

  useEffect(() => {
    const getTopValues = (data, config) => {
      let valueAndLabelArray = [];
      data.forEach((record, i) => {
        valueAndLabelArray.push([record, config.labels[i]]);
      });
      valueAndLabelArray = valueAndLabelArray
        .sort((a, b) => b[0] - a[0])
        .slice(0, config.limit);
      const topValues = valueAndLabelArray.map((arr, i) => arr[0]);
      const topLabels = valueAndLabelArray.map((arr, i) => arr[1]);
      setDoughnutData(topValues);
      setDoughnutLabels(topLabels);
    };

    const getChartData = config => {
      const data = config.labels.map(type => {
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
      return getTopValues(data, config);
    };

    Object.keys(chartData).length > 0 &&
      getChartData(chartConfig.doughnutChart);
  }, [chartData]);

  const graphConfig = {
    palette: palette("mpn65", chartConfig.doughnutChart.labels.length).map(
      a => `#${a}`
    ),
    labels: doughnutLabels,
    data: doughnutData,
  };

  const doughnut = {
    labels: graphConfig.labels,
    datasets: [
      {
        data: doughnutData,
        backgroundColor: graphConfig.palette,
        hoverBackgroundColor: ["#000"],
      },
    ],
  };

  return (
    <Card>
      <CardHeader>{chartConfig.doughnutChart.header}</CardHeader>
      <CardBody>
        {(recordCount === 0 && renderAlert(chartConfig.alert)) || (
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
  );
};

export default GridTableDoughnut;
