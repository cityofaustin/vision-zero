import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";

import { Container } from "reactstrap";

const FatalitiesMultiYear = () => {
  const today = moment().format("YYYY-MM-DD");
  const thisYear = moment().format("YYYY");
  const getYearsAgoLabel = yearsAgo => {
    return moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
  };

  const yearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;

  const getFatalitiesByYearsAgoUrl = yearsAgo => {
    let yearsAgoDate = moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
    return `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
  };

  const [yearToDateDeathArray, setYearToDateDeathArray] = useState([]);
  const [lastYearDeathArray, setLastYearDeathArray] = useState([]);
  const [twoYearsAgoDeathArray, setTwoYearsAgoDeathArray] = useState([]);
  const [threeYearsAgoDeathArray, setThreeYearsAgoDeathArray] = useState([]);
  const [fourYearsAgoDeathArray, setFourYearsAgoDeathArray] = useState([]);

  const calculateTotalFatalities = data => {
    let total = 0;
    data.data.forEach(record => (total += parseInt(record.death_cnt)));
    return total;
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
      console.log(monthTotal, cumulativeMonthTotal);
      return cumulativeMonthTotal;
    });
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      console.log(`Year to date fatalities: ${calculateTotalFatalities(res)}`);
      setYearToDateDeathArray(calculateMonthlyTotals(res, today));
    });

    // Fetch records from last year
    axios.get(getFatalitiesByYearsAgoUrl(1)).then(res => {
      console.log(`Last year fatalities: ${calculateTotalFatalities(res)}`);
      setLastYearDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from two years ago
    axios.get(getFatalitiesByYearsAgoUrl(2)).then(res => {
      console.log(`Two yeas ago fatalities: ${calculateTotalFatalities(res)}`);
      setTwoYearsAgoDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from three years ago
    axios.get(getFatalitiesByYearsAgoUrl(3)).then(res => {
      console.log(`Three yeas ago fatalities: ${calculateTotalFatalities(res)}`);
      setThreeYearsAgoDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch records from three years ago
    axios.get(getFatalitiesByYearsAgoUrl(4)).then(res => {
      console.log(`Four yeas ago fatalities: ${calculateTotalFatalities(res)}`);
      setFourYearsAgoDeathArray(calculateMonthlyTotals(res));
    });
  }, [
    yearToDateUrl,
    getFatalitiesByYearsAgoUrl(1),
    getFatalitiesByYearsAgoUrl(2),
    getFatalitiesByYearsAgoUrl(3),
    getFatalitiesByYearsAgoUrl(4),
    today
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
        backgroundColor: "rgba(192,10,10,1)", // Legend box
        // backgroundColor: "rgba(192,10,10,0.4)", // Legend box
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
        data: yearToDateDeathArray
      },
      {
        label: `${getYearsAgoLabel(1)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgb(0,0,0)", // Legend box
        borderColor: "rgb(0,0,0)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgb(0,0,0)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(0,0,0)",
        pointHoverBorderColor: "rgb(0,0,0)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: lastYearDeathArray
      },
      {
        label: `${getYearsAgoLabel(2)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgb(128,128,128)", // Legend box
        borderColor: "	rgb(128,128,128)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "	rgb(128,128,128)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(128,128,128)",
        pointHoverBorderColor: "rgb(128,128,128)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: twoYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(3)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgb(192,192,192)", // Legend box
        borderColor: "rgb(192,192,192)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgb(192,192,192)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(192,192,192)",
        pointHoverBorderColor: "rgb(192,192,192)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: threeYearsAgoDeathArray
      },
      {
        label: `${getYearsAgoLabel(4)}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgb(220,220,220)", // Legend box
        borderColor: "rgb(220,220,220)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgb(220,220,220)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgb(220,220,220)",
        pointHoverBorderColor: "rgb(220,220,220)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: fourYearsAgoDeathArray
      }
    ]
  };

  return (
    <Container>
      <h3>Fatal Crashes by Month for the Past Five Years</h3>
      <Line data={data} />
    </Container>
  );
};

export default FatalitiesMultiYear;
