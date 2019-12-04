import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Line } from "react-chartjs-2";

import { Container, Row, Col } from "reactstrap";

const FatalitiesMultiYear = () => {
  const thisYear = moment().format("YYYY");
  const lastMonthNumber = moment()
    .subtract(1, "month")
    .format("MM");
  const lastMonthLastDayNumber = moment(
    `${thisYear}-${lastMonthNumber}`,
    "YYYY-MM"
  ).daysInMonth();
  const lastMonthLastDayDate = `${thisYear}-${lastMonthNumber}-${lastMonthLastDayNumber}`;
  const lastMonthString = moment()
    .subtract(1, "month")
    .format("MMMM");

  const getYearsAgoLabel = yearsAgo => {
    return moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
  };

  const thisYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${lastMonthLastDayDate}T23:59:59'`;

  const getFatalitiesByYearsAgoUrl = yearsAgo => {
    let yearsAgoDate = moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
    return `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
  };

  const [thisYearDeathArray, setThisYearDeathArray] = useState([]);
  const [lastYearDeathArray, setLastYearDeathArray] = useState([]);
  const [twoYearsAgoDeathArray, setTwoYearsAgoDeathArray] = useState([]);
  const [threeYearsAgoDeathArray, setThreeYearsAgoDeathArray] = useState([]);
  const [fourYearsAgoDeathArray, setFourYearsAgoDeathArray] = useState([]);
  const [fiveYearsAgoDeathArray, setFiveYearsAgoDeathArray] = useState([]);

  const calculateYearlyTotals = deathArray => {
    return deathArray[deathArray.length - 1];
  };

  const calculateMonthlyTotals = (data, dateString) => {
    // Limit returned data to months of data available and prevent line from zeroing out
    // If dataString is passed in, convert to month string and use to truncate monthIntegerArray
    const monthLimit = dateString ? moment(dateString).format("MM") : "12";
    const monthIntegerArray = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12"
    ];
    const truncatedMonthIntegerArray = monthIntegerArray.slice(
      0,
      monthIntegerArray.indexOf(monthLimit) + 1
    );
    let cumulativeMonthTotal = 0;
    return truncatedMonthIntegerArray.map(month => {
      let monthTotal = 0;
      data.data.forEach(record => {
        if (moment(record.crash_date).format("MM") === month) {
          monthTotal += parseInt(record.death_cnt);
        }
      });
      cumulativeMonthTotal += monthTotal;
      return cumulativeMonthTotal;
    });
  };

  useEffect(() => {
    // Fetch records from this year through last month
    axios.get(thisYearUrl).then(res => {
      setThisYearDeathArray(calculateMonthlyTotals(res, lastMonthLastDayDate));
    });

    // Fetch records from last year
    axios.get(getFatalitiesByYearsAgoUrl(1)).then(res => {
      setLastYearDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from two years ago
    axios.get(getFatalitiesByYearsAgoUrl(2)).then(res => {
      setTwoYearsAgoDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from three years ago
    axios.get(getFatalitiesByYearsAgoUrl(3)).then(res => {
      setThreeYearsAgoDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from four years ago
    axios.get(getFatalitiesByYearsAgoUrl(4)).then(res => {
      setFourYearsAgoDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from five years ago
    axios.get(getFatalitiesByYearsAgoUrl(5)).then(res => {
      setFiveYearsAgoDeathArray(calculateMonthlyTotals(res));
    });
  }, [
    thisYearUrl,
    getFatalitiesByYearsAgoUrl(1),
    getFatalitiesByYearsAgoUrl(2),
    getFatalitiesByYearsAgoUrl(3),
    getFatalitiesByYearsAgoUrl(4),
    getFatalitiesByYearsAgoUrl(5),
    lastMonthLastDayDate
  ]);

  const data = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    datasets: [
      {
        label: `${thisYear}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "#08519c", // Legend box
        borderColor: "#08519c",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "#08519c",
        pointBackgroundColor: "#08519c",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#08519c",
        pointHoverBorderColor: "#08519c",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: thisYearDeathArray
      },
      {
        label: `${getYearsAgoLabel(1)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "#a50f15", // Legend box
        borderColor: "#a50f15",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "#a50f15",
        pointBackgroundColor: "#a50f15",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#a50f15",
        pointHoverBorderColor: "#a50f15",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: lastYearDeathArray
      },
      {
        label: `${getYearsAgoLabel(2)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "#de2d26", // Legend box
        borderColor: "	#de2d26",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "	#de2d26",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#de2d26",
        pointHoverBorderColor: "#de2d26",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: twoYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(3)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "#fb6a4a", // Legend box
        borderColor: "#fb6a4a",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "#fb6a4a",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#fb6a4a",
        pointHoverBorderColor: "#fb6a4a",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: threeYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(4)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "#fcae91", // Legend box
        borderColor: "#fcae91",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "#fcae91",
        pointBackgroundColor: "#fcae91",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#fcae91",
        pointHoverBorderColor: "#fcae91",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: fourYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(5)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "#fee5d9", // Legend box
        borderColor: "#fee5d9",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "#fee5d9",
        pointBackgroundColor: "#fee5d9",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#fee5d9",
        pointHoverBorderColor: "#fee5d9",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: fiveYearsAgoDeathArray
      }
    ]
  };

  return (
    <Container>
      <Row>
        <Col>
          <h3>Traffic Fatalities by Year</h3>
        </Col>
      </Row>
      <Row>
        <Col md="12">
          <h5 style={{ color: "#08519c" }}>
            As of {lastMonthString}, there have been <strong>{calculateYearlyTotals(thisYearDeathArray)}</strong> traffic fatalities in {thisYear}.
          </h5>
        </Col>
      </Row>
      <Row>
        <Col md="2">
          <Row>
            <Col md="12">
              <h6>Prior</h6>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <h6>Years:</h6>
            </Col>
          </Row>
        </Col>
        <Col md="2">
          <Row>
            <Col md="12">
              <h6><strong>{calculateYearlyTotals(lastYearDeathArray)}</strong></h6>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <h6>in {getYearsAgoLabel(1)}</h6>
            </Col>
          </Row>
        </Col>
        <Col md="2">
          <Row>
            <Col md="12">
              <h6><strong>{calculateYearlyTotals(twoYearsAgoDeathArray)}</strong></h6>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <h6>in {getYearsAgoLabel(2)}</h6>
            </Col>
          </Row>
        </Col>
        <Col md="2">
          <Row>
            <Col md="12">
              <h6><strong>{calculateYearlyTotals(threeYearsAgoDeathArray)}</strong></h6>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <h6>in {getYearsAgoLabel(3)}</h6>
            </Col>
          </Row>
        </Col>
        <Col md="2">
          <Row>
            <Col md="12">
              <h6><strong>{calculateYearlyTotals(fourYearsAgoDeathArray)}</strong></h6>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <h6>in {getYearsAgoLabel(4)}</h6>
            </Col>
          </Row>
        </Col>
        <Col md="2">
          <Row>
            <Col md="12">
              <h6><strong>{calculateYearlyTotals(fiveYearsAgoDeathArray)}</strong></h6>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <h6>in {getYearsAgoLabel(5)}</h6>
            </Col>
          </Row>
        </Col>
      </Row>
      <Line
        data={data}
        options={{
          tooltips: {
            mode: "x"
          }
        }}
      />
    </Container>
  );
};

export default FatalitiesMultiYear;
