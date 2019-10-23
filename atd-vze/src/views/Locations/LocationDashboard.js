import React from "react";

import { Col, Row } from "reactstrap";
import Widget02 from "../Widgets/Widget02";

const widgetsConfig = [
  {
    getAggregateDataArg: "apd_confirmed_death_count",
    mainText: "Fatalities",
    icon: "fa fa-heartbeat",
    color: "danger",
  },
  {
    getAggregateDataArg: "sus_serious_injry_cnt",
    mainText: "Serious Injuries",
    icon: "fa fa-medkit",
    color: "warning",
  },
  {
    getAggregateDataArg: "years_of_life_lost",
    mainText: "Total Crashes",
    icon: "fa fa-hourglass-end",
    color: "info",
  },
  {
    getAggregateDataArg: "count",
    mainText: "Years of Life Lost",
    icon: "fa fa-cab",
    color: "success",
  },
  {
    getAggregateDataArg: "total_people",
    mainText: "Total People (Primary + Non-Primary)",
    icon: "fa fa-user",
    color: "dark",
  },
  {
    getAggregateDataArg: "total_units",
    mainText: "Total Units",
    icon: "fa fa-car",
    color: "secondary",
  },
];

const LocationDashboard = ({ getAggregateData }) => {
  return (
    <Row>
      {widgetsConfig.map((widget, i) => (
        <Col key={i} xs="12" sm="6" md="4">
          <Widget02
            key={i}
            header={getAggregateData(widget.getAggregateDataArg)}
            mainText={widget.mainText}
            icon={widget.icon}
            color={widget.color}
          />
        </Col>
      ))}
    </Row>
  );
};

export default LocationDashboard;
