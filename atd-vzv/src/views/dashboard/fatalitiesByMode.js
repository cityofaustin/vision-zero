import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { HorizontalBar } from "react-chartjs-2";

import { Container, Row, Col } from "reactstrap";

// TODO Need modes of vehicle in crash in dataset
// TODO one legend for both pie charts (might need different library)
// Endpoint: https://data.austintexas.gov/resource/y2wy-tgr5.json
// Need to display pie chart (Motor Vehicle, Motorcycle, Pedestrian, Bicycle) of:
// 1. Year-to-date
// 2. Previous year

const FatalitiesByMode = () => {
  const thisYear = moment().format("YYYY");
  const yearLimit = 2010;
  const years = (() => {
    let years = [];
    for (let i = parseInt(thisYear); i >= yearLimit; i--) {
      years.push(i.toString());
    }
    return years;
  })();

  const [data, setData] = useState({});

  useEffect(() => {
    const getChartData = async () => {
      let newData = {};
      for (const year of years) {
        const url = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(death_cnt > 0) AND crash_date between '${year}-01-01T00:00:00' and '${year}-12-31T23:59:59'`;

        await axios.get(url).then(res => {
          newData = { ...newData, ...{ [year]: res.data } };
        });
      }
      setData(newData);
    };

    getChartData();
  }, []);

  return (
    <Container>
      <h3>Fatalities by Mode</h3>
      <Row>
        <Col sm="6">
          <h2>Test</h2>
        </Col>
        <Col sm="6">
          <h2>Test</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesByMode;
