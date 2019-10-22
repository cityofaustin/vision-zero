import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Doughnut } from "react-chartjs-2";

// Endpoint: https://data.austintexas.gov/resource/y2wy-tgr5.json
// TODO Need modes of vehicle in crash in dataset
// Need to display doughnut graph (Motor Vehicle, Motorcycle, Pedestrian, Bicycle) of:
// 1. Year-to-date
// 2. Previous year

const SeriousInjuryAndFatalCrashesByMode = props => {
  const today = moment().format("YYYY-MM-DD");
  const todayMonthYear = moment().format("-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  // TODO update urls with filters for mode
  const yearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(sus_serious_injry_cnt > 0 OR death_cnt > 0) AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(sus_serious_injry_cnt > 0 OR death_cnt > 0) AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;

  const [
    yearToDateInjuryDeathModeArray,
    setYearToDateInjuryDeathModeArray
  ] = useState([]);
  const [
    lastYearToDateInjuryDeathModeArray,
    setLastYearToDateInjuryDeathModeArray
  ] = useState([]);

  const calculateModeTotals = data => {
    // TODO replace strings in array with mode labels in DB
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

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      // setYearToDateInjuryDeathModeArray(calculateModeTotals(res));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
      // setLastYearToDateInjuryDeathModeArray(calculateModeTotals(res));
    });
  }, []);

  const yearToDateData = {
    labels: ["Motor Vehicle", "Motorcycle", "Pedestrian", "Bicycle"],
    datasets: [
      {
        // TODO use yearToDateInjuryDeathModeArray here
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
        data: [61, 18, 16, 4],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }
    ]
  };

  return (
    <div>
      <h3>Serious Injury + Fatal Crashes by Mode</h3>
      <h4>{thisYear}</h4>
      <Doughnut data={yearToDateData} />
      <h4>{lastYear}</h4>
      <Doughnut data={lastYearToDateData} />
    </div>
  );
};

export default SeriousInjuryAndFatalCrashesByMode;
