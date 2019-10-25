import React from "react";
import get from "lodash.get";
import { Alert } from "reactstrap";

export const renderAlert = alert => <Alert color="warning">{alert}</Alert>;

export const getChartData = (chartData, config) => {
  // Look for records that match labels and increment total
  const data = config.labels.map(type => {
    let typeTotal = 0;
    chartData[config.table].forEach(record => {
      // If record is a string, increment total if match
      if (config.isSingleRecord) {
        if (record[config.nestedKey][config.nestedPath] === type) {
          typeTotal++;
        }
      } else {
        // If record is an array of objects, iterate and increment total if match
        record[config.nestedKey].forEach(unit => {
          if (get(unit, config.nestedPath) === type) {
            typeTotal++;
          }
        });
      }
    });
    return typeTotal;
  });
  return data;
};

export const getTopValues = (data, config) => {
  // Sort data (descending) and slice to return top n records
  let valueAndLabelArray = [];
  data.forEach((record, i) => {
    valueAndLabelArray.push([record, config.labels[i]]);
  });
  return valueAndLabelArray.sort((a, b) => b[0] - a[0]).slice(0, config.limit);
};
