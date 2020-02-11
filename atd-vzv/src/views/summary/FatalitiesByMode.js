import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";

import { Container } from "reactstrap";
import { colors } from "../../constants/colors";
import { modeCategories } from "../../constants/filters";
import {
  dataEndDate,
  thisYear,
  ROLLING_YEARS_OF_DATA
} from "../../constants/time";
import { demographicsEndpointUrl } from "./queries/socrataQueries";

const FatalitiesByMode = () => {
  const modes = [
    {
      label: "Motor",
      flags: modeCategories.motorVehicleIds,
      color: colors.chartRed
    },
    {
      label: "Pedestrian",
      flags: modeCategories.pedestrianIds,
      color: colors.chartOrange
    },
    {
      label: "Motorcycle",
      flags: modeCategories.motorcycleIds,
      color: colors.chartRedOrange
    },
    {
      label: "Bicycle",
      flags: modeCategories.bicycleIds,
      color: colors.chartBlue
    },
    {
      label: "Other",
      flags: modeCategories.otherIds,
      color: colors.chartLightBlue
    }
  ];

  // Create array of ints of last 5 years
  const yearsArray = useCallback(() => {
    let years = [];
    let year = parseInt(dataEndDate.format("YYYY"));
    for (let i = 0; i <= ROLLING_YEARS_OF_DATA; i++) {
      years.unshift(year - i);
    }
    return years;
  }, []);

  const [chartData, setChartData] = useState(""); // {yearInt: [{record}, {record}, ...]}

  // Fetch data and set in state by years in yearsArray
  useEffect(() => {
    const getChartData = async () => {
      let newData = {};
      // Use Promise.all to let all requests resolve before setting chart data by year
      await Promise.all(
        yearsArray().map(async year => {
          // If current year, set end of query to last day of previous month, else set to last day of year
          let endDate =
            year.toString() === thisYear
              ? `${dataEndDate.format("YYYY-MM-DD")}T23:59:59`
              : `${year}-12-31T23:59:59`;
          let url = `${demographicsEndpointUrl}?$where=(prsn_injry_sev_id = 4) AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
          await axios.get(url).then(res => {
            newData = { ...newData, ...{ [year]: res.data } };
          });
          return null;
        })
      );
      setChartData(newData);
    };

    getChartData();
  }, [yearsArray]);

  const createChartLabels = () => yearsArray().map(year => `${year}`);

  // Tabulate fatalities by mode flags in data
  const getModeData = ids =>
    yearsArray().map(year => {
      return chartData[year].reduce((accumulator, record) => {
        ids.forEach(id => parseInt(record["mode_id"]) === id && accumulator++);
        return accumulator;
      }, 0);
    });

  // Sort mode order in stack by averaging total mode fatalities across all years in chart
  const sortModeData = modeData => {
    const averageModeFatalities = modeDataArray =>
      modeDataArray.reduce((a, b) => a + b) / modeDataArray.length;
    return modeData.sort(
      (a, b) => averageModeFatalities(b.data) - averageModeFatalities(a.data)
    );
  };

  // Create dataset for each mode type, data property is an array of fatality sums sorted chronologically
  const createTypeDatasets = () => {
    const modeData = modes.map(mode => ({
      backgroundColor: mode.color,
      borderColor: mode.color,
      borderWidth: 2,
      hoverBackgroundColor: mode.color,
      hoverBorderColor: mode.color,
      label: mode.label,
      data: getModeData(mode.flags)
    }));
    // Determine order of modes in each year stack
    return sortModeData(modeData);
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  return (
    <Container>
      <Bar
        data={data}
        options={{
          maintainAspectRatio: true,
          scales: {
            xAxes: [
              {
                stacked: true
              }
            ],
            yAxes: [
              {
                stacked: true
              }
            ]
          }
        }}
      />
      <p className="text-center">
        Data Through: {dataEndDate.format("MMMM YYYY")}
      </p>
    </Container>
  );
};

export default FatalitiesByMode;
