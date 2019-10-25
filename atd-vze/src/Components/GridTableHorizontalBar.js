import React, { useState, useEffect } from "react";
import get from "lodash.get";
import { renderAlert } from "./gridTableHelpers";

import { Card, CardHeader, CardBody } from "reactstrap";
import { HorizontalBar } from "react-chartjs-2";
import { colors } from "../styles/colors";

const GridTableHorizontalBar = ({ chartData, chartConfig }) => {
  const recordCount = get(chartData, chartConfig.totalRecordsPath);

  const [horizontalData, setHorizontalData] = useState([]);
  const [horizontalLabels, setHorizontalLabels] = useState([]);

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
      setHorizontalData(topValues);
      setHorizontalLabels(topLabels);
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

    getChartData(chartConfig.horizontalBarChart);
  }, [chartData]);

  const horizontalBar = {
    labels: horizontalLabels,
    datasets: [
      {
        label: chartConfig.horizontalBarChart.title,
        backgroundColor: colors.success,
        borderColor: colors.grey200,
        borderWidth: 1,
        hoverBackgroundColor: colors.darkgreen,
        hoverBorderColor: colors.grey700,
        data: horizontalData,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>{chartConfig.horizontalBarChart.header}</CardHeader>
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
