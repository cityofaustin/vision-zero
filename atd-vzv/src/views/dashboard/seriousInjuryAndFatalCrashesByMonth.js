import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import line from "react-chartjs-2";

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

  const [yearToDateInjuryTotal, setYearToDateInjuryTotal] = useState(0);
  const [lastYearToDateInjuryTotal, setLastYearToDateInjuryTotal] = useState(0);

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
      setYearToDateInjuryTotal(calculateTotalInjuries(res));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUri).then(res => {
      setLastYearToDateInjuryTotal(calculateTotalInjuries(res));
    });
  }, []);

  return (
    <div>
      <h3>Year-to-Date Serious Injuries</h3>
      <p>
        {thisYear}: {yearToDateInjuryTotal}
      </p>
      <p>
        {lastYear}: {lastYearToDateInjuryTotal}
      </p>
    </div>
  );
};

export default SeriousInjuryAndFatalCrashesByMonth;
