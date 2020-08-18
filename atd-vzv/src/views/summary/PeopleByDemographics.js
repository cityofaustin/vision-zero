import React, { useEffect, useState, useReducer } from "react";
import axios from "axios";
import { HorizontalBar } from "react-chartjs-2";
import "chartjs-plugin-stacked100";
import ChartTypeSelector from "./Components/ChartTypeSelector";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import { colors } from "../../constants/colors";
import { dataEndDate, yearsArray, dataStartDate } from "../../constants/time";
import { personEndpointUrl } from "./queries/socrataQueries";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";

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
  raceData: {
    label: "Race/Ethnicity",
    categoryKey: "prsn_ethnicity_id", // Field used to filter data
    categoryType: "target", // Filter response data by target value or ranges of values
    categories: {
      "1": "White",
      "2": "Hispanic",
      "3": "Black",
      "4": "Asian",
      "5": "Other or unknown",
      "6": "American Indian or Alaska Native",
    },
    categoryForExceptions: "5", // Category for missing or unknown data
    query: `SELECT date_extract_y(crash_date) as year, COUNT(*) as total, prsn_ethnicity_id, prsn_injry_sev_id
              WHERE ${dateCondition}
              GROUP BY year, prsn_ethnicity_id, prsn_injry_sev_id
              ORDER BY year`,
    colors: chartColors,
  },
  ageData: {
    label: "Age",
    categoryKey: "prsn_age",
    categoryType: "range",
    categories: {
      "0 to 15": [0, 15],
      "16 to 25": [16, 25],
      "26 to 35": [26, 35],
      "36 to 45": [36, 45],
      "46 to 55": [46, 55],
      "55 to 64": [56, 64],
      "65 or greater": [65, 200],
      Unknown: [null, null],
    },
    categoryForExceptions: "Unknown",
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
  },
  genderData: {
    label: "Gender",
    categoryKey: "prsn_gndr_id",
    categoryType: "target",
    categories: {
      "1": "Male",
      "2": "Female",
      "0": "Unknown",
    },
    categoryForExceptions: "0",
    query: `SELECT date_extract_y(crash_date) as year, COUNT(*) as total, prsn_gndr_id, prsn_injry_sev_id
              WHERE ${dateCondition}
              GROUP BY year, prsn_gndr_id, prsn_injry_sev_id
              ORDER BY year`,
    colors: chartColors,
  },
};

const PeopleByDemographics = () => {
  const [chartType, setChartType] = useState("Race/Ethnicity");
  const [crashType, setCrashType] = useState(null);
  const [chartData, setChartData] = useState({});
  const [demoData, dispatch] = useReducer(demoDataReducer, {});

  function demoDataReducer(demoData, action) {
    switch (action.type) {
      case "setData":
        return { ...demoData, ...action.payload };
      default:
        return null;
    }
  }

  // Fetch data for each visualization in config
  useEffect(() => {
    if (crashType !== null && Object.keys(demoData).length === 0) {
      const requests = Object.entries(chartConfigs).map(([dataKey, config]) =>
        axios.get(url + encodeURIComponent(config.query), {
          dataId: dataKey,
        })
      );

      axios.all(requests).then((resArr) => {
        const responses = resArr.reduce(
          (acc, res) => ({ ...acc, ...{ [res.config.dataId]: res.data } }),
          {}
        );

        dispatch({
          type: "setData",
          payload: responses,
        });
      });
    }
  }, [crashType, demoData]);

  // Sort data and filter data after fetch
  useEffect(() => {
    const sortByType = (data) => {
      const typeMap = { injury: "1", fatal: "4" };

      return data.reduce(
        (acc, record) => {
          record.prsn_injry_sev_id === typeMap.fatal &&
            acc.fatalities.push(record);

          record.prsn_injry_sev_id === typeMap.injury &&
            acc.seriousInjuries.push(record);

          acc.fatalitiesAndSeriousInjuries.push(record);

          return acc;
        },
        {
          seriousInjuries: [],
          fatalities: [],
          fatalitiesAndSeriousInjuries: [],
        }
      );
    };

    const formatChartData = (dataKey, data) => {
      const isTarget = chartConfigs[dataKey].categoryType === "target";
      const isRange = chartConfigs[dataKey].categoryType === "range";

      const formattedTypes = {};
      const categoriesMap = chartConfigs[dataKey].categories;
      const categoryKey = chartConfigs[dataKey].categoryKey;
      const years = yearsArray();

      Object.entries(data).forEach(([typeLabel, typeData]) => {
        let formatted = {};

        Object.entries(categoriesMap).forEach(
          ([categoryKey, categoryValue]) => {
            const categoryData = [];
            for (let i = 0; i < years.length; i++) {
              categoryData.push(0);
            }

            if (isTarget) {
              formatted[categoryValue] = categoryData;
            } else if (isRange) {
              formatted[categoryKey] = categoryData;
            }
          }
        );

        const getYearIndex = (currentYear, recordYear) =>
          years.length - 1 - (currentYear - parseInt(recordYear));

        if (isTarget) {
          typeData.forEach((record) => {
            const categoryValue = record[categoryKey];
            const category = categoriesMap[categoryValue];
            const exceptionCategory =
              categoriesMap[chartConfigs[dataKey].categoryForExceptions];
            const currentYear = years[years.length - 1];
            const yearIndex = getYearIndex(currentYear, record.year);

            // Divert undefined categories or missing values to specified category
            if (category === undefined || categoryValue === undefined) {
              formatted[exceptionCategory][yearIndex] += parseInt(record.total);
            } else {
              formatted[category][yearIndex] += parseInt(record.total);
            }
          });
        }

        if (isRange) {
          const ranges = Object.entries(categoriesMap);
          const rangeForExceptions =
            chartConfigs[dataKey].categoryForExceptions;

          typeData.forEach((record) => {
            ranges.forEach(([rangeString, rangeArray], i) => {
              const floor = rangeArray[0];
              const ceiling = rangeArray[1];
              const age = parseInt(record.prsn_age);
              const total = parseInt(record.total);
              const currentYear = years[years.length - 1];
              const yearIndex = getYearIndex(currentYear, record.year);

              if (!age && !floor && !ceiling) {
                formatted[rangeForExceptions][yearIndex] += total;
              } else if (age >= floor && age <= ceiling) {
                formatted[rangeString][yearIndex] += total;
              }
            });
          });
        }

        formattedTypes[typeLabel] = formatted;
      });

      return formattedTypes;
    };

    // After data is fetched, sort and format into years/categories
    if (Object.keys(demoData).length !== 0 && demoData.status !== "formatted") {
      Object.entries(demoData).forEach(([dataKey, data]) => {
        const sorted = sortByType(data);
        const formatted = formatChartData(dataKey, sorted);

        dispatch({
          type: "setData",
          payload: { [dataKey]: formatted, status: "formatted" },
        });
      });
    }
  }, [chartType, demoData, crashType]);

  // On crash or chart type change, replace chart data and colors from config
  useEffect(() => {
    if (demoData.status === "formatted") {
      const [configName, config] = Object.entries(chartConfigs).find(
        ([configName, config]) => config.label === chartType
      );

      const barLabels =
        config.categoryType === "range"
          ? Object.keys(config.categories)
          : Object.values(config.categories);

      const data = {
        labels: yearsArray(),
        datasets: barLabels.map((category, i) => ({
          label: barLabels[i],
          data: demoData[configName][crashType.name][category],
          backgroundColor: config.colors[i],
          borderColor: config.colors[i],
          hoverBackgroundColor: config.colors[i],
          hoverBorderColor: config.colors[i],
        })),
      };

      setChartData(data);
    }
  }, [demoData, chartType, crashType]);

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
        chartTypes={Object.values(chartConfigs).map((value) => value.label)}
        chartType={chartType}
        setChartType={setChartType}
      />
      <Row>
        <Col>
          <HorizontalBar
            redraw
            data={chartData}
            height={null}
            width={null}
            options={{
              responsive: true,
              aspectRatio: 1,
              maintainAspectRatio: false,
              plugins: {
                // Imported to display percentages without calculating them from data
                stacked100: { enable: true, replaceTooltipLabel: false },
              },
              tooltips: {
                callbacks: {
                  label: (tooltipItem, data) => {
                    const datasetIndex = tooltipItem.datasetIndex;
                    const datasetLabel = data.datasets[datasetIndex].label;
                    const originalValue =
                      data.originalData[datasetIndex][tooltipItem.index];
                    const rateValue =
                      data.calculatedData[datasetIndex][tooltipItem.index];
                    return `${datasetLabel}: ${originalValue} (${rateValue}%)`;
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
