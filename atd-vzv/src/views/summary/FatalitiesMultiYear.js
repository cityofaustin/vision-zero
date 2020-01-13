import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Line } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import { colors } from "../../constants/colors";

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
    const getFatalitiesByYearsAgoUrl = yearsAgo => {
      let yearsAgoDate = moment()
        .subtract(yearsAgo, "year")
        .format("YYYY");
      return `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
    };

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
  }, []);

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
        backgroundColor: colors.blue, // Legend box
        borderColor: colors.blue,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.blue,
        pointBackgroundColor: colors.blue,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.blue,
        pointHoverBorderColor: colors.blue,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: thisYearDeathArray
      },
      {
        label: `${getYearsAgoLabel(1)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient5Of5, // Legend box
        borderColor: colors.redGradient5Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient5Of5,
        pointBackgroundColor: colors.redGradient5Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient5Of5,
        pointHoverBorderColor: colors.redGradient5Of5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: lastYearDeathArray
      },
      {
        label: `${getYearsAgoLabel(2)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient4Of5, // Legend box
        borderColor: colors.redGradient4Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient4Of5,
        pointBackgroundColor: colors.redGradient4Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient4Of5,
        pointHoverBorderColor: colors.redGradient4Of5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: twoYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(3)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient3Of5, // Legend box
        borderColor: colors.redGradient3Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient3Of5,
        pointBackgroundColor: colors.redGradient3Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient3Of5,
        pointHoverBorderColor: colors.redGradient3Of5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: threeYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(4)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient2Of5, // Legend box
        borderColor: colors.redGradient2Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient2Of5,
        pointBackgroundColor: colors.redGradient2Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient2Of5,
        pointHoverBorderColor: colors.redGradient2Of5,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: fourYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(5)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: colors.redGradient1Of5, // Legend box
        borderColor: colors.redGradient1Of5,
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: colors.redGradient1Of5,
        pointBackgroundColor: colors.redGradient1Of5,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colors.redGradient1Of5,
        pointHoverBorderColor: colors.redGradient1Of5,
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
        <Col md="12">
          <h5 style={{ color: colors.blue }}>
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
              <h6>
                <strong>{calculateYearlyTotals(lastYearDeathArray)}</strong>
              </h6>
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
              <h6>
                <strong>{calculateYearlyTotals(twoYearsAgoDeathArray)}</strong>
              </h6>
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
              <h6>
                <strong>
                  {calculateYearlyTotals(threeYearsAgoDeathArray)}
                </strong>
              </h6>
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
              <h6>
                <strong>{calculateYearlyTotals(fourYearsAgoDeathArray)}</strong>
              </h6>
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
              <h6>
                <strong>{calculateYearlyTotals(fiveYearsAgoDeathArray)}</strong>
              </h6>
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
