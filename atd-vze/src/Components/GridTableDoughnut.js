import React, { useState, useEffect } from "react";
import get from "lodash.get";
import { renderAlert, getChartData, getTopValues } from "./gridTableHelpers";

import { Badge, Card, CardHeader, CardBody } from "reactstrap";
import palette from "google-palette";
import { Doughnut } from "react-chartjs-2";

const GridTableDoughnut = ({ chartData, chartConfig }) => {
  const recordCount = get(chartData, chartConfig.totalRecordsPath);

  const [doughnutData, setDoughnutData] = useState([]);
  const [doughnutLabels, setDoughnutLabels] = useState([]);

  useEffect(() => {
    // If records exist, get data and then get top n records/labels
    if (Object.keys(chartData).length > 0) {
      const doughnutData = getChartData(chartData, chartConfig);
      const topChartData = getTopValues(doughnutData, chartConfig);

      // Separate data values and labels and set state to update chart
      const topValues = topChartData.map(arr => arr[0]);
      const topLabels = topChartData.map(arr => arr[1]);
      setDoughnutData(topValues);
      setDoughnutLabels(topLabels);
    }
  }, [chartData, chartConfig]);

  const graphConfig = {
    palette: palette("mpn65", chartConfig.labels.length).map(a => `#${a}`),
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
      <CardHeader>{chartConfig.header}</CardHeader>
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
