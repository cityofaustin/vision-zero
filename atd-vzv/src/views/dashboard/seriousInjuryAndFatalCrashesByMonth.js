import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";

// Endpoint: https://data.austintexas.gov/resource/y2wy-tgr5.json
// Need to display line graph (x-axis is Jan-Dec, y-axis is count) of:
// 1. Year-to-date
// 2. Previous year

const SeriousInjuryAndFatalCrashesByMonth = props => {
  const today = moment().format("YYYY-MM-DD");
  const todayMonthYear = moment().format("-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  const yearToDateUri = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(sus_serious_injry_cnt > 0 OR death_cnt > 0) AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUri = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(sus_serious_injry_cnt > 0 OR death_cnt > 0) AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;

  const [yearToDateInjuryDeathTotal, setYearToDateInjuryDeathTotal] = useState(
    0
  );
  const [
    lastYearToDateInjuryDeathTotal,
    setLastYearToDateInjuryDeathTotal
  ] = useState(0);
  const [yearToDateInjuryDeathArray, setYearToDateInjuryDeathArray] = useState(
    []
  );
  const [
    lastYearToDateInjuryDeathArray,
    setLastYearToDateInjuryDeathArray
  ] = useState([]);

  const calculateMonthlyTotals = data => {
    console.log(data.data[0]);
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
    return monthIntegerArray.map(month => {
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

  const calculateTotalInjuries = data => {
    let total = 0;
    data.data.forEach(record => {
      total += parseInt(record.sus_serious_injry_cnt);
      total += parseInt(record.death_cnt);
    });
    return total;
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUri).then(res => {
      setYearToDateInjuryDeathTotal(calculateTotalInjuries(res));
      setYearToDateInjuryDeathArray(calculateMonthlyTotals(res));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUri).then(res => {
      setLastYearToDateInjuryDeathTotal(calculateTotalInjuries(res));
      setLastYearToDateInjuryDeathArray(calculateMonthlyTotals(res));
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
        backgroundColor: "rgba(75,192,192,0.4)",
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
    <div>
      <h3>Serious Injury + Fatal Crashes by Month</h3>
      <Line data={data} />
      <p>
        {thisYear}: {yearToDateInjuryDeathTotal}
      </p>
      <p>
        {lastYear}: {lastYearToDateInjuryDeathTotal}
      </p>
    </div>
  );
};

export default SeriousInjuryAndFatalCrashesByMonth;
