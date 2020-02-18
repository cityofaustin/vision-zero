import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { crashEndpointUrl } from "./queries/socrataQueries";
import {
  dataEndDate,
  summaryCurrentYearStartDate,
  summaryCurrentYearEndDate
} from "../../constants/time";
import { getYearsAgoLabel } from "./helpers/helpers";
import { colors } from "../../constants/colors";

const FatalitiesMultiYear = () => {
  const [thisYearDeathArray, setThisYearDeathArray] = useState([]);
  const [lastYearDeathArray, setLastYearDeathArray] = useState([]);
  const [twoYearsAgoDeathArray, setTwoYearsAgoDeathArray] = useState([]);
  const [threeYearsAgoDeathArray, setThreeYearsAgoDeathArray] = useState([]);
  const [fourYearsAgoDeathArray, setFourYearsAgoDeathArray] = useState([]);
  const [crashType, setCrashType] = useState([]);

  const calculateYearlyTotals = deathArray => {
    return deathArray[deathArray.length - 1];
  };

  const renderHeader = () => {
    return (
      <h6 style={{ color: colors.blue, textAlign: "center" }}>
        As of {dataEndDate.format("MMMM")}, there have been{" "}
        <strong>{calculateYearlyTotals(thisYearDeathArray)}</strong>{" "}
        traffic-related{" "}
        {crashType.textString && crashType.textString.toLowerCase()} in{" "}
        {dataEndDate.format("YYYY")}.
      </h6>
    );
  };

  useEffect(() => {
    const thisYearUrl = `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${summaryCurrentYearStartDate}T00:00:00' and '${summaryCurrentYearEndDate}T23:59:59'`;

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
          // If the crash date is in the current month, compile data
          if (moment(record.crash_date).format("MM") === month) {
            // Compile data based on the selected crash type
            switch (crashType.name) {
              case "fatalities":
                monthTotal += parseInt(record.death_cnt);
                break;
              case "seriousInjuries":
                monthTotal += parseInt(record.sus_serious_injry_cnt);
                break;
              default:
                monthTotal +=
                  parseInt(record.death_cnt) +
                  parseInt(record.sus_serious_injry_cnt);
                break;
            }
          }
        });
        cumulativeMonthTotal += monthTotal;
        return cumulativeMonthTotal;
      });
    };

    const getFatalitiesByYearsAgoUrl = yearsAgo => {
      let yearsAgoDate = moment()
        .subtract(yearsAgo, "year")
        .format("YYYY");
      console.log(crashType.queryStringCrash);
      return `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
    };

    const queryYears = () => {
      // Fetch records for this year through last full month of data
      axios.get(thisYearUrl).then(res => {
        setThisYearDeathArray(
          calculateMonthlyTotals(res, summaryCurrentYearEndDate)
        );
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
    };

    // Wait for crashType to be passed up from setCrashType component,
    // then fetch records
    if (crashType.queryStringCrash) {
      queryYears();
    }
  }, [crashType]);

  // Build data object with data from the previous five years
  const data = {
    labels: moment.months(),
    datasets: [
      {
        label: getYearsAgoLabel(0),
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
        label: getYearsAgoLabel(1),
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
        label: getYearsAgoLabel(2),
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
        label: getYearsAgoLabel(3),
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
        label: getYearsAgoLabel(4),
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
      }
    ]
  };

  return (
    <Container>
      <Row style={{ paddingBottom: "0.75em" }}>
        <Col>
          <h3 style={{ textAlign: "center" }}>
            {crashType.textString} by Year
          </h3>
        </Col>
      </Row>
      <Row style={{ paddingBottom: 20 }}>
        <Col>{renderHeader()}</Col>
      </Row>
      <Row style={{ paddingBottom: 20 }}>
        <Col>
          <h6 style={{ textAlign: "center" }}>Prior Years:</h6>
        </Col>
        <Col>
          <h6 style={{ textAlign: "center" }}>
            <strong>{calculateYearlyTotals(lastYearDeathArray)}</strong> in{" "}
            {getYearsAgoLabel(1)}
          </h6>
        </Col>
        <Col>
          <h6 style={{ textAlign: "center" }}>
            <strong>{calculateYearlyTotals(twoYearsAgoDeathArray)}</strong> in{" "}
            {getYearsAgoLabel(2)}
          </h6>
        </Col>
        <Col>
          <h6 style={{ textAlign: "center" }}>
            <strong>{calculateYearlyTotals(threeYearsAgoDeathArray)}</strong> in{" "}
            {getYearsAgoLabel(3)}
          </h6>
        </Col>
        <Col>
          <h6 style={{ textAlign: "center" }}>
            <strong>{calculateYearlyTotals(fourYearsAgoDeathArray)}</strong> in{" "}
            {getYearsAgoLabel(4)}
          </h6>
        </Col>
      </Row>
      <Row>
        <Col>
          <Line
            data={data}
            options={{
              tooltips: {
                mode: "x"
              }
            }}
          />
        </Col>
      </Row>
      <Row style={{ paddingTop: "0.75em" }}>
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesMultiYear;
