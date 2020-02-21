import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { HorizontalBar } from "react-chartjs-2";
import { Container, Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";
import {
  dataEndDate,
  thisYear,
  ROLLING_YEARS_OF_DATA
} from "../../constants/time";
import { demographicsEndpointUrl } from "./queries/socrataQueries";

const DemographicsByYear = () => {
  const ageCategories = [
    { label: "Under 18", categoryValue: 1, color: colors.chartRed },
    {
      label: "18 to 44",
      categoryValue: 2,
      color: colors.chartLightBlue
    },
    {
      label: "45 to 64",
      categoryValue: 3,
      color: colors.chartGreen
    },
    { label: "65 and older", categoryValue: 4, color: colors.chartPurple },
    { label: "No data", categoryValue: "noData", color: colors.danger }
  ];

  const sexCategories = [
    {
      label: "Male",
      categoryValue: 1,
      color: colors.chartRed
    },
    {
      label: "Female",
      categoryValue: 2,
      color: colors.chartLightBlue
    },
    { label: "Unknown", categoryValue: 0, color: colors.warning },
    { label: "No data", categoryValue: "noData", color: colors.danger }
  ];

  const raceCategories = [
    {
      label: "White",
      categoryValue: 1,
      color: colors.chartRed
    },
    {
      label: "Hispanic",
      categoryValue: 2,
      color: colors.chartLightBlue
    },
    { label: "Black", categoryValue: 3, color: colors.chartGreen },
    {
      label: "Asian",
      categoryValue: 4,
      color: colors.chartPurple
    },
    {
      label: "Other",
      categoryValue: 5,
      color: colors.chartAqua
    },
    {
      label: "American Indian or Alaska Native",
      categoryValue: 6,
      color: colors.chartBlue
    },
    { label: "Unknown", categoryValue: 0, color: colors.warning },
    { label: "No data", categoryValue: "noData", color: colors.danger }
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

  const [activeTab, setActiveTab] = useState("prsn_age");
  const [chartData, setChartData] = useState(); // {yearInt: [{record}, {record}, ...]}
  const [crashType, setCrashType] = useState([]);

  const toggle = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

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

  // Tabulate fatalities by demographics in data
  const getData = categoryValue =>
    yearsArray().map(year => {
      let categoryTotal = chartData[year].reduce((accumulator, record) => {
        switch (activeTab) {
          case "prsn_age":
            switch (categoryValue) {
              case 1:
                record.prsn_age < 18 && accumulator++;
                break;
              case 2:
                record.prsn_age >= 18 && record.prsn_age <= 44 && accumulator++;
                break;
              case 3:
                record.prsn_age > 44 && record.prsn_age <= 64 && accumulator++;
                break;
              case 4:
                record.prsn_age > 64 && accumulator++;
                break;
              case "noData":
                !record.prsn_age && accumulator++;
                break;
              default:
                break;
            }
            break;
          case "prsn_gndr_id":
            record.prsn_gndr_id === `${categoryValue}` && accumulator++;
            break;
          case "prsn_ethnicity_id":
            // If the ethnicity id value matches the category value, increment the count for the associated category
            record.prsn_ethnicity_id === `${categoryValue}` && accumulator++;
            // If the ethnicity id value is missing and the category value is "noData", increment the count for the "No data" category
            !record.prsn_ethnicity_id &&
              categoryValue === "noData" &&
              accumulator++;
            break;
          default:
            break;
        }
        return accumulator;
      }, 0);
      const percentage = (categoryTotal / chartData[year].length) * 100;
      return percentage;
    });

  // Sort category order in stack by averaging total demographic stats across all years in chart
  const sortData = data => {
    const averageCrashes = dataArray =>
      dataArray.reduce((a, b) => a + b) / dataArray.length;
    return data.sort((a, b) => averageCrashes(b.data) - averageCrashes(a.data));
  };

  // Create dataset for each demographic type
  const createTypeDatasets = () => {
    let categories;
    switch (activeTab) {
      case "prsn_age":
        categories = ageCategories;
        break;
      case "prsn_gndr_id":
        categories = sexCategories;
        break;
      case "prsn_ethnicity_id":
        categories = raceCategories;
        break;
      default:
        break;
    }
    const data = categories.map(category => ({
      backgroundColor: category.color,
      borderColor: category.color,
      borderWidth: 2,
      hoverBackgroundColor: category.color,
      hoverBorderColor: category.color,
      label: category.label,
      data: getData(category.categoryValue)
    }));
    // If age is selected, keep original sorting to make chart more readable
    // For other categories, determine order of category (highest to lowest proportion)
    if (activeTab === "prsn_age") {
      return data;
    } else {
      return sortData(data);
    }
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  return (
    <Container>
      <Row className="pb-3">
        <Col>
          <h3 className="text-center">
            {crashType.textString} Demographics
          </h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <Nav tabs className="justify-content-center">
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "prsn_age" })}
                onClick={() => {
                  toggle("prsn_age");
                }}
              >
                Age
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "prsn_gndr_id" })}
                onClick={() => {
                  toggle("prsn_gndr_id");
                }}
              >
                Sex
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({
                  active: activeTab === "prsn_ethnicity_id"
                })}
                onClick={() => {
                  toggle("prsn_ethnicity_id");
                }}
              >
                Race/Ethnicity
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
      </Row>
      <Row>
        <Col>
          <HorizontalBar
            data={data}
            options={{
              maintainAspectRatio: true,
              scales: {
                xAxes: [
                  {
                    stacked: true,
                    ticks: {
                      max: 100
                    }
                  }
                ],
                yAxes: [
                  {
                    stacked: true
                  }
                ]
              },
              tooltips: {
                callbacks: {
                  label: function(tooltipItem, data) {
                    let label = data.datasets[tooltipItem.datasetIndex].label;
                    let roundedValue =
                      Math.round(tooltipItem.value * 100) / 100;
                    return `${label}: ${roundedValue}%`;
                  }
                }
              }
            }}
          />
        </Col>
      </Row>
      <Row className="pt-3">
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
    </Container>
  );
};

export default DemographicsByYear;
