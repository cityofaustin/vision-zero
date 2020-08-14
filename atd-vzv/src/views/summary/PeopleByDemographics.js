import React, { useEffect, useState, useReducer } from "react";
import axios from "axios";
import { HorizontalBar } from "react-chartjs-2";
import ChartTypeSelector from "./Components/ChartTypeSelector";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import { colors } from "../../constants/colors";
import { dataEndDate, yearsArray, dataStartDate } from "../../constants/time";
import { personEndpointUrl } from "./queries/socrataQueries";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";

const PeopleByDemographics = () => {
  const [chartType, setChartType] = useState("Race/Ethnicity");
  const [crashType, setCrashType] = useState([]);
  const [areRequestsSent, setAreRequestsSent] = useState(false);
  const [demoData, dispatch] = useReducer(demoDataReducer, {});

  function demoDataReducer(demoData, action) {
    const { type, payload } = action;

    switch (type) {
      case "setData":
        return { ...demoData, ...payload };
      default:
        return null;
    }
  }

  const url = `${personEndpointUrl}?$query=`;

  const dateCondition = `crash_date BETWEEN '${dataStartDate.format(
    "YYYY-MM-DD"
  )}' and '${dataEndDate.format("YYYY-MM-DD")}'`;

  const chartColors = [
    colors.viridis1Of6Highest,
    colors.viridis2Of6,
    colors.viridis3Of6,
    colors.viridis4Of6,
    colors.viridis5Of6,
    colors.viridis6Of6Lowest,
  ];

  const chartConfigs = {
    "Race/Ethnicity": {
      categories: {
        White: 1,
        Hispanic: 2,
        Black: 3,
        Asian: 4,
        "Other or unknown": 5,
        "American Indian or Alaska Native": 6,
      },
      query: `SELECT date_extract_y(crash_date) as year, COUNT(*) as total, prsn_ethnicity_id, prsn_injry_sev_id
              WHERE ${dateCondition}
              GROUP BY year, prsn_ethnicity_id, prsn_injry_sev_id
              ORDER BY year`,
      colors: chartColors,
      dataKey: "raceData",
    },
    Age: {
      categories: {
        "0 to 15": [0, 15],
        "16 to 25": [16, 25],
        "26 to 35": [26, 35],
        "36 to 45": [36, 45],
        "46 to 55": [46, 55],
        "55 to 64": [55, 64],
        "65 or greater": [65, 200],
      },
      query: `SELECT date_extract_y(crash_date) as year, COUNT(*) as total, prsn_age, prsn_injry_sev_id
              WHERE ${dateCondition}
              GROUP BY year, prsn_age, prsn_injry_sev_id
              ORDER BY year`,
      colors: [
        colors.demoAge1of8,
        colors.demoAge2of8,
        colors.demoAge3of8,
        colors.demoAge4of8,
        colors.demoAge5of8,
        colors.demoAge6of8,
        colors.demoAge7of8,
        colors.demoAge8of8,
      ],
      dataKey: "ageData",
    },
    Gender: {
      categories: {
        Male: 1,
        Female: 2,
        Unknown: 0,
      },
      query: `SELECT date_extract_y(crash_date) as year, COUNT(*) as total, prsn_gndr_id, prsn_injry_sev_id
              WHERE ${dateCondition}
              GROUP BY year, prsn_gndr_id, prsn_injry_sev_id
              ORDER BY year`,
      colors: chartColors,
      dataKey: "genderData",
    },
  };

  useEffect(() => {
    !!crashType &&
      !areRequestsSent &&
      Object.keys(chartConfigs).forEach((config) => {
        const chartConfig = chartConfigs[config];

        axios.get(url + encodeURIComponent(chartConfig.query)).then((res) => {
          const records = res.data;

          dispatch({
            type: "setData",
            payload: { [chartConfig.dataKey]: records },
          });
        });
      });

    setAreRequestsSent(true);
  }, [url, crashType, chartConfigs, areRequestsSent]);

  useEffect(() => {
    const sortByType = (data) => {
      const typeDict = { injury: "1", fatal: "4" };

      const sorted = { injury: [], fatal: [], all: [] };

      for (let i = 0; i < data.length; i++) {
        const record = data[i];

        if (record.prsn_injry_sev_id === typeDict.fatal) {
          sorted.fatal.push(record);
        }

        if (record.prsn_injry_sev_id === typeDict.injury) {
          sorted.injury.push(record);
        }

        sorted.all.push(record);
      }

      return sorted;
    };

    const isAllDataSet =
      demoData !== null &&
      Object.keys(chartConfigs).length === Object.keys(demoData).length;

    if (isAllDataSet) {
      // Process data
      Object.entries(demoData).forEach(([dataKey, data]) => {
        const sorted = sortByType(data);
        console.log(sorted);
      });
      // useReducer to update one piece of state that holds data for all graphs
      // reducerState[chartType][crashType] to set data in chart?
    }
  }, [chartType, demoData, chartConfigs]);

  // const formatChartData = (data) => { dispatch({ type: "setData", payload: { [dataKey]: formattedObject } });};

  // // Fetch data and set in state by years in yearsArray
  // useEffect(() => {
  //   // Wait for crashType to be passed up from setCrashType component
  //   if (crashType.queryStringPerson) {
  //     const getChartData = async () => {
  //       let newData = {};
  //       // Use Promise.all to let all requests resolve before setting chart data by year
  //       await Promise.all(
  //         yearsArray().map(async (year) => {
  //           // If getting data for current year (only including years past January),
  //           // set end of query to last day of previous month,
  //           // else if getting data for previous years, set end of query to last day of year
  //           let endDate =
  //             year.toString() === dataEndDate.format("YYYY")
  //               ? `${dataEndDate.format("YYYY-MM-DD")}T23:59:59`
  //               : `${year}-12-31T23:59:59`;
  //           let url = `${personEndpointUrl}?$where=${crashType.queryStringPerson} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
  //           await axios.get(url).then((res) => {
  //             newData = { ...newData, ...{ [year]: res.data } };
  //           });
  //           return null;
  //         })
  //       );
  //       setChartData(newData);
  //     };
  //     getChartData();
  //   }
  // }, [crashType]);

  // const createChartLabels = () => yearsArray().map((year) => `${year}`);

  // // Tabulate crashes by demographics in data
  // const getData = (categoryValue, isWholeNumber) =>
  //   yearsArray().map((year) => {
  //     let categoryTotal = chartData[year].reduce((accumulator, record) => {
  //       switch (chartType) {
  //         case "Age":
  //           switch (categoryValue) {
  //             // If the person age value is missing, increment the count for
  //             // category value 0 ("Unknown") in the chart
  //             case 0:
  //               !record.prsn_age && accumulator++;
  //               break;
  //             // For all other cases, if the person age value falls within the category value range,
  //             // increment the count for the associated category
  //             case 1:
  //               record.prsn_age < 18 && accumulator++;
  //               break;
  //             case 2:
  //               record.prsn_age >= 18 && record.prsn_age <= 44 && accumulator++;
  //               break;
  //             case 3:
  //               record.prsn_age > 44 && record.prsn_age <= 64 && accumulator++;
  //               break;
  //             case 4:
  //               record.prsn_age > 64 && accumulator++;
  //               break;
  //             default:
  //               break;
  //           }
  //           break;
  //         case "Gender":
  //           switch (categoryValue) {
  //             // If the gender id is missing or 0 ("Unknown"), increment the count for
  //             // category value 0 ("Unknown") in the chart
  //             case 0:
  //               (!record.prsn_gndr_id || parseInt(record.prsn_gndr_id) === 0) &&
  //                 accumulator++;
  //               break;
  //             // For all other cases, if the gender id value matches the category value,
  //             // increment the count for the associated category
  //             default:
  //               record.prsn_gndr_id === `${categoryValue}` && accumulator++;
  //               break;
  //           }
  //           break;
  //         case "Race/Ethnicity":
  //           switch (categoryValue) {
  //             // If the ethnicity id is either missing, 5 ("Other") or 0 ("Unknown"),
  //             // increment the count for category value 5 ("Other or unknown") in the chart
  //             case 5:
  //               (!record.prsn_ethnicity_id ||
  //                 parseInt(record.prsn_ethnicity_id) === 5 ||
  //                 parseInt(record.prsn_ethnicity_id) === 0) &&
  //                 accumulator++;
  //               break;
  //             // For all other cases, if the ethnicity id value matches the category value,
  //             // increment the count for the associated category
  //             default:
  //               record.prsn_ethnicity_id === `${categoryValue}` &&
  //                 accumulator++;
  //               break;
  //           }
  //           break;
  //         default:
  //           break;
  //       }
  //       return accumulator;
  //     }, 0);
  //     const overallTotal = chartData[year].length;
  //     const percentage = (categoryTotal / overallTotal) * 100;
  //     const wholeNumbers = {
  //       categoryTotal: categoryTotal,
  //       overallTotal: overallTotal,
  //     };
  //     // If isWholeNumber is true, return the wholeNumbers Object for display in tooltips,
  //     // else return percentage for chartJS to render the chart
  //     const data = isWholeNumber ? wholeNumbers : percentage;
  //     return data;
  //   });

  // // Sort category order in stack and apply colors by averaging total demographic stats across all years in chart
  // const sortAndColorData = (data) => {
  //   const averageCrashes = (dataArray) =>
  //     dataArray.reduce((a, b) => a + b) / dataArray.length;
  //   const dataSorted = [...data].sort(
  //     (a, b) => averageCrashes(b.data) - averageCrashes(a.data)
  //   );
  //   // If age is selected, keep original sorting to make chart more readable
  //   // For other categories, determine order of category (highest to lowest proportion)
  //   data = chartType === "Age" ? data : dataSorted;
  //   data.forEach((category, i) => {
  //     const color = chartColors[i];
  //     category.backgroundColor = color;
  //     category.borderColor = color;
  //     category.hoverBackgroundColor = color;
  //     category.hoverBorderColor = color;
  //   });
  //   return data;
  // };

  // // Create dataset for each demographic type
  // const createTypeDatasets = () => {
  //   let categories;
  //   switch (chartType) {
  //     case "Age":
  //       categories = ageCategories;
  //       break;
  //     case "Gender":
  //       categories = sexCategories;
  //       break;
  //     case "Race/Ethnicity":
  //       categories = raceCategories;
  //       break;
  //     default:
  //       break;
  //   }
  //   const data = categories.map((category) => ({
  //     borderWidth: 2,
  //     label: category.label,
  //     data: getData(category.categoryValue, false),
  //     wholeNumbers: getData(category.categoryValue, true),
  //   }));
  //   return sortAndColorData(data);
  // };

  // const data = {
  //   labels: createChartLabels(),
  //   datasets: !!chartData && createTypeDatasets(),
  // };

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className="text-left font-weight-bold">
            Demographics{" "}
            <InfoPopover config={popoverConfig.summary.demographics} />
          </h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
      <Row>
        <Col>
          <hr />
        </Col>
      </Row>
      <ChartTypeSelector
        chartTypes={Object.keys(chartConfigs)}
        chartType={chartType}
        setChartType={setChartType}
      />
      <Row>
        <Col>
          <HorizontalBar
            redraw
            data={null}
            height={null}
            width={null}
            options={{
              responsive: true,
              aspectRatio: 1,
              maintainAspectRatio: false,
              scales: {
                xAxes: [
                  {
                    stacked: true,
                    ticks: {
                      max: 100,
                    },
                  },
                ],
                yAxes: [
                  {
                    stacked: true,
                  },
                ],
              },
              tooltips: {
                callbacks: {
                  label: function (tooltipItem, data) {
                    let label = data.datasets[tooltipItem.datasetIndex].label;
                    let categoryTotal =
                      data.datasets[tooltipItem.datasetIndex].wholeNumbers[
                        tooltipItem.index
                      ].categoryTotal;
                    let roundedPercentage =
                      Math.round(tooltipItem.value * 100) / 100;
                    return `${label}: ${categoryTotal} (${roundedPercentage}%)`;
                  },
                },
              },
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default PeopleByDemographics;
