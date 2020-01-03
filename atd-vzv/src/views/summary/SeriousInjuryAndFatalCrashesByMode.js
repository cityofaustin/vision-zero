import React, { useEffect } from "react";
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

const SeriousInjuryAndFatalCrashesByMode = () => {
  const today = moment().format("YYYY-MM-DD");
  const todayMonthYear = moment().format("-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  // TODO update urls with filters for mode
  const yearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(sus_serious_injry_cnt > 0 OR death_cnt > 0) AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(sus_serious_injry_cnt > 0 OR death_cnt > 0) AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;

  /*
    We are commenting this out only to clear console warnings.
    The following code will be needed as soon as we have data endpoints.
  */

  /*
  const [
    yearToDateInjuryDeathModeArray,
    setYearToDateInjuryDeathModeArray
  ] = useState([]);
  const [
    lastYearToDateInjuryDeathModeArray,
    setLastYearToDateInjuryDeathModeArray
  ] = useState([]);

  const calculateModeTotals = data => {
    // TODO replace strings in array with mode names in DB
    const modeArray = ["Motor Vehicle", "Motorcycle", "Pedestrian", "Bicycle"];
    return modeArray.map(mode => {
      let modeTotal = 0;
      data.data.forEach(record => {
        // TODO replace crash_date ref with mode ref
        // If crash contains mode, add to mode total
        if (record.crash_date === mode) {
          modeTotal += parseInt(record.sus_serious_injry_cnt);
        }
      });
      return modeTotal;
    });
  };

  const calculateTotalInjuries = data => {
    let total = 0;
    data.data.forEach(record => {
      total += parseInt(record.sus_serious_injry_cnt);
      total += parseInt(record.death_cnt);
    });
    return total;
  };
  */

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      // setYearToDateInjuryDeathModeArray(calculateModeTotals(res));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
      // setLastYearToDateInjuryDeathModeArray(calculateModeTotals(res));
    });
  }, [yearToDateUrl, previousYearUrl]);

  const yearToDateData = {
    labels: ["Motor Vehicle", "Motorcycle", "Pedestrian", "Bicycle"],
    datasets: [
      {
        // TODO use yearToDateInjuryDeathModeArray here and style
        label: "Total crashes",
        data: [61, 13, 20, 6],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }
    ]
  };

  const lastYearToDateData = {
    labels: ["Motor Vehicle", "Motorcycle", "Pedestrian", "Bicycle"],
    datasets: [
      {
        // TODO use lastYearToDateInjuryDeathModeArray here and style
        label: "Total crashes",
        data: [61, 18, 16, 4],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }
    ]
  };

  return (
    <Container>
      <Row>
        <Col sm="6">
          <h4>{thisYear} YTD</h4>
          <HorizontalBar data={yearToDateData} />
        </Col>
        <Col sm="6">
          <h4>{lastYear} YTD</h4>
          <HorizontalBar data={lastYearToDateData} />
        </Col>
      </Row>
    </Container>
  );
};

export default SeriousInjuryAndFatalCrashesByMode;
