import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";

import { Container, Row, Col } from "reactstrap";
import { getYearsOfLifeLost } from "./helpers/helpers";
import { todayMonthYear, thisYear, lastYear } from "../../constants/time";
import {
  demographicsEndpointUrl,
  yearsOfLifeLostYTDUrl,
  previousYearYearsOfLifeLostYTDUrl
} from "./queries/socrataQueries";

const YearsOfLifeLost = () => {
  const twoYearsAgo = moment()
    .subtract(2, "year")
    .format("YYYY");
  const threeYearsAgo = moment()
    .subtract(3, "year")
    .format("YYYY");
  const fourYearsAgo = moment()
    .subtract(4, "year")
    .format("YYYY");

  const twoYearsAgoUrl = `${demographicsEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${twoYearsAgo}-01-01T00:00:00' and '${twoYearsAgo}${todayMonthYear}T23:59:59'`;
  const threeYearsAgoUrl = `${demographicsEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${threeYearsAgo}-01-01T00:00:00' and '${threeYearsAgo}${todayMonthYear}T23:59:59'`;
  const fourYearsAgoUrl = `${demographicsEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${fourYearsAgo}-01-01T00:00:00' and '${fourYearsAgo}${todayMonthYear}T23:59:59'`;

  const [yearToDateYearsLostTotal, setYearToDateYearsLostTotal] = useState(0);
  const [
    lastYearToDateYearsLostTotal,
    setLastYearToDateYearsLostTotal
  ] = useState(0);
  const [
    twoYearsAgoYearToDateYearsLostTotal,
    setTwoYearsAgoYearToDateYearsLostTotal
  ] = useState(0);
  const [
    threeYearsAgoYearToDateYearsLostTotal,
    setThreeYearsAgoYearToDateYearsLostTotal
  ] = useState(0);
  const [
    fourYearsAgoYearToDateYearsLostTotal,
    setFourYearsAgoYearToDateYearsLostTotal
  ] = useState(0);

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearsOfLifeLostYTDUrl).then(res => {
      setYearToDateYearsLostTotal(getYearsOfLifeLost(res.data));
    });

    // Fetch last year-to-date records
    axios.get(previousYearYearsOfLifeLostYTDUrl).then(res => {
      setLastYearToDateYearsLostTotal(getYearsOfLifeLost(res.data));
    });

    // Fetch two years ago year-to-date records
    axios.get(twoYearsAgoUrl).then(res => {
      setTwoYearsAgoYearToDateYearsLostTotal(getYearsOfLifeLost(res.data));
    });

    // Fetch three years ago year-to-date records
    axios.get(threeYearsAgoUrl).then(res => {
      setThreeYearsAgoYearToDateYearsLostTotal(getYearsOfLifeLost(res.data));
    });

    // Fetch four years ago year-to-date records
    axios.get(fourYearsAgoUrl).then(res => {
      setFourYearsAgoYearToDateYearsLostTotal(getYearsOfLifeLost(res.data));
    });
  }, [twoYearsAgoUrl, threeYearsAgoUrl, fourYearsAgoUrl]);

  const data = {
    labels: [
      `${fourYearsAgo}`,
      `${threeYearsAgo}`,
      `${twoYearsAgo}`,
      `${lastYear}`,
      `${thisYear}`
    ],
    datasets: [
      {
        label: "Years of Life Lost Year to Date",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(192,10,10,0.4)", // Legend box
        borderColor: "rgba(192,10,10,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(192,10,10,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(192,10,10,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [
          `${fourYearsAgoYearToDateYearsLostTotal}`,
          `${threeYearsAgoYearToDateYearsLostTotal}`,
          `${twoYearsAgoYearToDateYearsLostTotal}`,
          `${lastYearToDateYearsLostTotal}`,
          `${yearToDateYearsLostTotal}`
        ]
      }
    ]
  };

  return (
    <Container>
      <Row>
        <Col>
          <Line
            data={data}
            options={{
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                      userCallback: function(value) {
                        return value
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      }
                    }
                  }
                ]
              },
              tooltips: {
                callbacks: {
                  label: function(tooltipItem) {
                    return tooltipItem.yLabel
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  }
                }
              }
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default YearsOfLifeLost;
