import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { colors } from "../../constants/colors";
import { Container } from "reactstrap";
import { dataEndDate, thisYear } from "../../constants/time";
import { demographicsEndpointUrl } from "./queries/socrataQueries";

const FatalitiesByMode = () => {
  // Define stacked bar chart properties in order of stack
  const modes = [
    { label: "Motor", flags: ["motor_vehicle_fl"], color: colors.chartRed },
    {
      label: "Pedestrian",
      flags: ["pedestrian_fl"],
      color: colors.chartOrange
    },
    {
      label: "Motorcycle",
      flags: ["motorcycle_fl"],
      color: colors.chartRedOrange
    },
    {
      label: "Pedalcyclist",
      flags: ["pedalcyclist_fl"],
      color: colors.chartBlue
    },
    {
      label: "Other",
      flags: [
        "other_fl",
        "train_fl",
        "motorized_conveyance_fl",
        "non_contact_fl",
        "towed_push_trailer_fl"
      ],
      color: colors.chartLightBlue
    }
  ];

  const yearLimit = 5; // Number of years to display in chart

  // Create array of ints of last 5 years
  const yearsArray = useCallback(() => {
    let years = [];
    let year = parseInt(dataEndDate.format("YYYY"));
    for (let i = 0; i < yearLimit; i++) {
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
          // If getting data for current year (only including years past January), set end of query to last day of previous month,
          // else if getting data for previous years, set end of query to last day of year
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

  // Tabulate fatalities by mode from data
  const getModeData = flags =>
    yearsArray().map(year => {
      let fatalities = 0;
      chartData[year].forEach(record =>
        flags.forEach(flag => record[`${flag}`] === "Y" && fatalities++)
      );
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
      data: getModeData(mode.flags)
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
      <p className="text-center">
        Data Through: {dataEndDate.format("MMMM YYYY")}
      </p>
    </Container>
  );
};

export default FatalitiesByMode;
