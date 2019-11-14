import React, { useState, useEffect } from "react";
import get from "lodash.get";
import { renderAlert, getChartData, getTopValues } from "./gridTableHelpers";

import { Card, CardHeader, CardBody } from "reactstrap";
import { HorizontalBar } from "react-chartjs-2";
import { colors } from "../styles/colors";

const GridTableHorizontalBar = ({ chartData, chartConfig }) => {
  const recordCount = get(chartData, chartConfig.totalRecordsPath);

  const [horizontalData, setHorizontalData] = useState([]);
  const [horizontalLabels, setHorizontalLabels] = useState([]);

  useEffect(() => {
    // If records exist, get data and then get top n records/labels
    if (Object.keys(chartData).length > 0) {
      const horizontalData = getChartData(chartData, chartConfig);
      const topChartData = getTopValues(horizontalData, chartConfig);

      // Separate data values and labels and set state to update chart
      const topValues = topChartData.map(arr => arr[0]);
      const topLabels = topChartData.map(arr => arr[1]);
      setHorizontalData(topValues);
      setHorizontalLabels(topLabels);
    }
  }, [chartData, chartConfig]);

  const horizontalBar = {
    labels: horizontalLabels,
    datasets: [
      {
        label: chartConfig.title,
        backgroundColor: chartConfig.color,
        borderColor: colors.grey200,
        borderWidth: 1,
        hoverBackgroundColor: chartConfig.hoverColor,
        hoverBorderColor: colors.grey700,
        data: horizontalData,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>{chartConfig.header}</CardHeader>
      <CardBody>
        {(recordCount === 0 && renderAlert(chartConfig.alert)) || (
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
  );
};

export default GridTableHorizontalBar;
