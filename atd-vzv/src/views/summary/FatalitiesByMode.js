import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";
import { colors } from "../../constants/colors";

import { Container } from "reactstrap";
import { thisYear } from "./helpers/time";
import { demographicsEndpointUrl } from "./queries/socrataQueries";

const FatalitiesByMode = () => {
  // Define stacked bar chart properties in order of stack
  const modes = [
    { label: "Motor", flag: "motor_vehicle_fl", color: colors.chartRed },
    { label: "Pedestrian", flag: "pedestrian_fl", color: colors.chartOrange },
    {
      label: "Motorcycle",
      flag: "motorcycle_fl",
      color: colors.chartRedOrange
    },
    { label: "Pedalcyclist", flag: "pedalcyclist_fl", color: colors.chartBlue }
  ];
  const yearLimit = 10; // Number of years to display in chart
  const yearsArray = (() => {
    let years = [];
    for (let i = 0; i < yearLimit; i++) {
      years.push(parseInt(thisYear) - i);
    }
    return years;
  })();

  const [chartData, setChartData] = useState("");
  const [latestRecordDate, setLatestRecordDate] = useState("");

  // Fetch data (Mode of fatality in crash)
  useEffect(() => {
    const getChartData = async () => {
      let newData = {};
      // Use Promise.all to let all requests resolve before setting chart data by year
      await Promise.all(
        yearsArray.map(async year => {
          const url = `${demographicsEndpointUrl}?$where=(prsn_injry_sev_id = 4) AND crash_date between '${year}-01-01T00:00:00' and '${year}-12-31T23:59:59'`;

          await axios.get(url).then(res => {
            newData = { ...newData, ...{ [year]: res.data } };
          });
          return null;
        })
      );

      setChartData(newData);
    };

    getChartData();
  }, []);

  // Fetch latest record from demographics dataset and set for chart subheading
  useEffect(() => {
    const url = `${demographicsEndpointUrl}?$limit=1&$order=crash_date DESC&$where=crash_date < '${thisYear}-12-31T23:59:59'`;

    axios.get(url).then(res => {
      const latestRecordDate = res.data[0].crash_date;
      const formattedLatestDate = moment(latestRecordDate).format("MMMM YYYY");
      setLatestRecordDate(formattedLatestDate);
    });
  }, []);

  const createChartLabels = () => yearsArray.sort().map(year => `${year}`);

  // Tabulate fatalities by mode from data
  const getModeData = flag =>
    yearsArray.map(year => {
      let fatalities = 0;

      chartData[year].forEach(f => f[`${flag}`] === "Y" && fatalities++);
      return fatalities;
    });

  // Create dataset for each mode type
  // data property is an array of fatality sums sorted chronologically
  const createTypeDatasets = () =>
    modes.map(mode => ({
      backgroundColor: mode.color,
      borderColor: mode.color,
      borderWidth: 2,
      hoverBackgroundColor: mode.color,
      hoverBorderColor: mode.color,
      label: mode.label,
      data: getModeData(mode.flag)
    }));

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
      <p className="text-center">Data Through: {latestRecordDate}</p>
    </Container>
  );
};

export default FatalitiesByMode;
