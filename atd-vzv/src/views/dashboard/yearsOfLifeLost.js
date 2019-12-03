import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";

import { Container, Row, Col } from "reactstrap";

const YearsOfLifeLost = () => {
  const today = moment().format("YYYY-MM-DD");
  const todayMonthYear = moment().format("-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");
  const twoYearsAgo = moment()
    .subtract(2, "year")
    .format("YYYY");
  const threeYearsAgo = moment()
    .subtract(3, "year")
    .format("YYYY");
  const fourYearsAgo = moment()
    .subtract(4, "year")
    .format("YYYY");

  const yearToDateUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;
  const twoYearsAgoUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${twoYearsAgo}-01-01T00:00:00' and '${twoYearsAgo}${todayMonthYear}T23:59:59'`;
  const threeYearsAgoUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${threeYearsAgo}-01-01T00:00:00' and '${threeYearsAgo}${todayMonthYear}T23:59:59'`;
  const fourYearsAgoUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${fourYearsAgo}-01-01T00:00:00' and '${fourYearsAgo}${todayMonthYear}T23:59:59'`;

  const [yearToDateYearsLostTotal,
    setYearToDateYearsLostTotal
  ] = useState(0);
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

  const getYearsOfLifeLost = fatalityData => {
    // Assume 75 year life expectancy,
    // Find the difference between person.prsn_age & 75
    // Sum over the list of ppl with .reduce
    return fatalityData.reduce((accumulator, fatalityRecord) => {
      let years = 0;
      if (fatalityRecord.prsn_age !== undefined) {
        let yearsLifeLost = 75 - Number(fatalityRecord.prsn_age);
        // What if the person is older than 75?
        // For now, so we don't have negative numbers,
        // Assume years of life lost is 0
        years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
      }
      return accumulator + years;
    }, 0); // start with a count at 0 years
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      setYearToDateYearsLostTotal(getYearsOfLifeLost(res.data));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
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
  }, [
    yearToDateUrl,
    previousYearUrl,
    twoYearsAgoUrl,
    threeYearsAgoUrl,
    fourYearsAgoUrl
  ]);

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
      <h3>Year-to-Date Years of Life Lost</h3>
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
