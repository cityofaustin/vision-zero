import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";

import { Container } from "reactstrap";

const SeriousInjuryAndFatalCrashesByMonth = () => {
  const today = moment().format("YYYY-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  const yearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(sus_serious_injry_cnt > 0 OR death_cnt > 0) AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(sus_serious_injry_cnt > 0 OR death_cnt > 0) AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}-12-31T23:59:59'`;

  const [yearToDateInjuryDeathArray, setYearToDateInjuryDeathArray] = useState(
    []
  );
  const [
    lastYearToDateInjuryDeathArray,
    setLastYearToDateInjuryDeathArray
  ] = useState([]);

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
    return truncatedMonthIntegerArray.map(month => {
      let monthTotal = 0;
      data.data.forEach(record => {
        if (moment(record.crash_date).format("MM") === month) {
          monthTotal += parseInt(record.sus_serious_injry_cnt);
          monthTotal += parseInt(record.death_cnt);
        }
      });
      return monthTotal;
    });
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      setYearToDateInjuryDeathArray(calculateMonthlyTotals(res, today));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
      setLastYearToDateInjuryDeathArray(calculateMonthlyTotals(res));
    });
  }, [yearToDateUrl, previousYearUrl, today]);

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
        data: yearToDateInjuryDeathArray
      },
      {
        label: `${lastYear}`,
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)", // Legend box
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: lastYearToDateInjuryDeathArray
      }
    ]
  };

  return (
    <Container>
      <Line data={data} />
    </Container>
  );
};

export default SeriousInjuryAndFatalCrashesByMonth;
