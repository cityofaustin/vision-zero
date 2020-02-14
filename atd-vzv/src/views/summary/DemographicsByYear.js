import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { HorizontalBar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";
import {
  dataEndDate,
  thisYear,
  ROLLING_YEARS_OF_DATA
} from "../../constants/time";
import { demographicsEndpointUrl } from "./queries/socrataQueries";

const DemographicsByYear = () => {

  const sexCategories = [
    { label: "Unknown", categoryValue: [0], color: colors.chartRed },
    {
      label: "Male",
      categoryValue: [1],
      color: colors.chartOrange
    },
    {
      label: "Female",
      categoryValue: [2],
      color: colors.chartRedOrange
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

  const [ chartData, setChartData ] = useState([""]); // {yearInt: [{record}, {record}, ...]}
  const [ crashType, setCrashType ] = useState([]);

  // Fetch data and set in state by years in yearsArray
  useEffect(() => {
    // Wait for crashType to be passed up from setCrashType component
    if (crashType.queryStringDemographics) {
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
            let url = `${demographicsEndpointUrl}?$where=${crashType.queryStringDemographics} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
            await axios.get(url).then(res => {
              newData = { ...newData, ...{ [year]: res.data } };
            });
            return null;
          })
        );
        setChartData(newData);
      };
      getChartData();
    }
  }, [yearsArray, crashType]);

  const createChartLabels = () => yearsArray().map(year => `${year}`);

  // Tabulate fatalities by mode flags in data
  const getSexData = categoryValue =>
    yearsArray().map(year => {
      if (chartData[year]) {
        return chartData[year].reduce((accumulator, record) => {
          record.prsn_gndr_id === `${categoryValue}` && accumulator++;
          return accumulator;
        }, 0);
      }
    });

  // Sort mode order in stack by averaging total mode fatalities across all years in chart
  const sortSexData = sexData => {
    console.log(sexData);
    const averageSexCrashes = sexDataArray =>
      sexDataArray.reduce((a, b) => a + b) / sexDataArray.length;
    return sexData.sort(
      (a, b) => averageSexCrashes(b.data) - averageSexCrashes(a.data)
    );
  };

  // Create dataset for each mode type, data property is an array of fatality sums sorted chronologically
  const createTypeDatasets = () => {
    const sexData = sexCategories.map(category => ({
      backgroundColor: category.color,
      borderColor: category.color,
      borderWidth: 2,
      hoverBackgroundColor: category.color,
      hoverBorderColor: category.color,
      label: category.label,
      data: getSexData(category.categoryValue)
    }));
    // // Determine order of modes in each year stack
    return sortSexData(sexData);
  };

  const dataAge = {
    labels: ["Age"],
    datasets: [
      {
        backgroundColor: "red",
        borderColor: "red",
        borderWidth: 2,
        hoverBackgroundColor: "red",
        hoverBorderColor: "red",
        label: ["Under 18"],
        data: [15]
      },
      {
        backgroundColor: "green",
        borderColor: "green",
        borderWidth: 2,
        hoverBackgroundColor: "green",
        hoverBorderColor: "green",
        label: ["18 to 44"],
        data: [30]
      },
      {
        backgroundColor: "blue",
        borderColor: "blue",
        borderWidth: 2,
        hoverBackgroundColor: "blue",
        hoverBorderColor: "blue",
        label: ["45 to 64"],
        data: [25]
      },
      {
        backgroundColor: "yellow",
        borderColor: "yellow",
        borderWidth: 2,
        hoverBackgroundColor: "yellow",
        hoverBorderColor: "yellow",
        label: ["65 and Over"],
        data: [20]
      }
    ],
  };

  const dataSex = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
    // datasets: [
    //   {
    //     backgroundColor: "red",
    //     borderColor: "red",
    //     borderWidth: 2,
    //     hoverBackgroundColor: "red",
    //     hoverBorderColor: "red",
    //     label: ["Female"],
    //     data: [35]
    //   },
    //   {
    //     backgroundColor: "green",
    //     borderColor: "green",
    //     borderWidth: 2,
    //     hoverBackgroundColor: "green",
    //     hoverBorderColor: "green",
    //     label: ["Male"],
    //     data: [40]
    //   },
    //   {
    //     backgroundColor: "blue",
    //     borderColor: "blue",
    //     borderWidth: 2,
    //     hoverBackgroundColor: "blue",
    //     hoverBorderColor: "blue",
    //     label: ["Unknown"],
    //     data: [25]
    //   },
    // ],
  };

  const dataRace = {
    labels: ["Race"],
    datasets: [
      {
        backgroundColor: "red",
        borderColor: "red",
        borderWidth: 2,
        hoverBackgroundColor: "red",
        hoverBorderColor: "red",
        label: ["Unknown"],
        data: [25]
      },
      {
        backgroundColor: "green",
        borderColor: "green",
        borderWidth: 2,
        hoverBackgroundColor: "green",
        hoverBorderColor: "green",
        label: ["White"],
        data: [15]
      },
      {
        backgroundColor: "blue",
        borderColor: "blue",
        borderWidth: 2,
        hoverBackgroundColor: "blue",
        hoverBorderColor: "blue",
        label: ["Hispanic"],
        data: [20]
      },
      {
        backgroundColor: "yellow",
        borderColor: "yellow",
        borderWidth: 2,
        hoverBackgroundColor: "yellow",
        hoverBorderColor: "yellow",
        label: ["Black"],
        data: [10]
      },
      {
        backgroundColor: "pink",
        borderColor: "pink",
        borderWidth: 2,
        hoverBackgroundColor: "pink",
        hoverBorderColor: "pink",
        label: ["Asian"],
        data: [7]
      },
      {
        backgroundColor: "red",
        borderColor: "red",
        borderWidth: 2,
        hoverBackgroundColor: "red",
        hoverBorderColor: "red",
        label: ["Other"],
        data: [13]
      },
      {
        backgroundColor: "green",
        borderColor: "green",
        borderWidth: 2,
        hoverBackgroundColor: "green",
        hoverBorderColor: "green",
        label: ["American Indian or Alaska Native"],
        data: [10]
      },
    ],
  };

  return (
    <Container>
      <Row style={{ paddingBottom: "0.75em" }}>
        <Col>
          <h3 style={{ textAlign: "center" }}>
            {crashType.textString} Demographics
          </h3>
        </Col>
      </Row>
      <Row>
        <Col>
        <HorizontalBar
            data={dataAge}
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
          <HorizontalBar
            data={dataSex}
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
          <HorizontalBar
            data={dataRace}
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
        </Col>
      </Row>
      <Row style={{ paddingTop: "0.75em" }}>
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
    </Container>
  );
};

export default DemographicsByYear;
