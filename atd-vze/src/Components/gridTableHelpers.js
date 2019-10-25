import React from "react";
import { Alert } from "reactstrap";

export const renderAlert = alert => <Alert color="warning">{alert}</Alert>;

const getTopChartValues = (data, config) => {
  let valueAndLabelArray = [];
  data.forEach((record, i) => {
    valueAndLabelArray.push([record, config.labels[i]]);
  });
  return valueAndLabelArray.sort((a, b) => b[0] - a[0]).slice(0, config.limit);
};
