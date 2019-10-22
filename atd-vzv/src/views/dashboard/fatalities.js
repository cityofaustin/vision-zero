import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

// Endpoint: https://data.austintexas.gov/resource/y2wy-tgr5.json
// Need to display pictorial chart of:
// 1. Year-to-date fatalities for current
// 2. Fatalities from previous year

const Fatalities = props => {
  const today = moment().format("YYYY-MM-DD");
  const todayMonthYear = moment().format("-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  const yearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;

  const [yearToDateInjuryTotal, setYearToDateInjuryTotal] = useState(0);
  const [lastYearToDateInjuryTotal, setLastYearToDateInjuryTotal] = useState(0);

  const calculateTotalInjuries = data => {
    let total = 0;
    data.data.forEach(
      record => (total += parseInt(record.sus_serious_injry_cnt))
    );
    return total;
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      setYearToDateInjuryTotal(calculateTotalInjuries(res));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
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

export default Fatalities;
