import React, { useEffect, useState } from "react";
import axios from "axios";
import { HorizontalBar } from "react-chartjs-2";
import { Container, Row, Col, Button } from "reactstrap";
import styled from "styled-components";
import classnames from "classnames";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";
import { dataEndDate, yearsArray } from "../../constants/time";
import { personEndpointUrl } from "./queries/socrataQueries";

const PeopleByDemographics = () => {
  const ageCategories = [
    { label: "Under 18", categoryValue: 1 },
    {
      label: "18 to 44",
      categoryValue: 2
    },
    {
      label: "45 to 64",
      categoryValue: 3
    },
    {
      label: "65 and older",
      categoryValue: 4
    },
    {
      label: "Unknown",
      categoryValue: 0
    }
  ];

  const sexCategories = [
    {
      label: "Male",
      categoryValue: 1
    },
    {
      label: "Female",
      categoryValue: 2
    },
    {
      label: "Unknown",
      categoryValue: 0
    }
  ];

  const raceCategories = [
    {
      label: "White",
      categoryValue: 1
    },
    {
      label: "Hispanic",
      categoryValue: 2
    },
    { label: "Black", categoryValue: 3 },
    {
      label: "Asian",
      categoryValue: 4
    },
    {
      label: "Other or unknown",
      categoryValue: 5
    },
    {
      label: "American Indian or Alaska Native",
      categoryValue: 6
    }
  ];

  const chartColors = [
    colors.viridis1Of6Highest,
    colors.viridis2Of6,
    colors.viridis3Of6,
    colors.viridis4Of6,
    colors.viridis5Of6,
    colors.viridis6Of6Lowest
  ];

  const [activeTab, setActiveTab] = useState("prsn_age");
  const [chartData, setChartData] = useState(null); // {yearInt: [{record}, {record}, ...]}
  const [crashType, setCrashType] = useState([]);

  const toggle = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  // Fetch data and set in state by years in yearsArray
  useEffect(() => {
    // Wait for crashType to be passed up from setCrashType component
    if (crashType.queryStringPerson) {
      const getChartData = async () => {
        let newData = {};
        // Use Promise.all to let all requests resolve before setting chart data by year
        await Promise.all(
          yearsArray().map(async year => {
            // If getting data for current year (only including years past January),
            // set end of query to last day of previous month,
            // else if getting data for previous years, set end of query to last day of year
            let endDate =
              year.toString() === dataEndDate.format("YYYY")
                ? `${dataEndDate.format("YYYY-MM-DD")}T23:59:59`
                : `${year}-12-31T23:59:59`;
            let url = `${personEndpointUrl}?$where=${crashType.queryStringPerson} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
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
  }, [crashType]);

  const createChartLabels = () => yearsArray().map(year => `${year}`);

  // Tabulate crashes by demographics in data
  const getData = (categoryValue, isWholeNumber) =>
    yearsArray().map(year => {
      let categoryTotal = chartData[year].reduce((accumulator, record) => {
        switch (activeTab) {
          case "prsn_age":
            switch (categoryValue) {
              // If the person age value is missing, increment the count for
              // category value 0 ("Unknown") in the chart
              case 0:
                !record.prsn_age && accumulator++;
                break;
              // For all other cases, if the person age value falls within the category value range,
              // increment the count for the associated category
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
              default:
                break;
            }
            break;
          case "prsn_gndr_id":
            switch (categoryValue) {
              // If the gender id is missing or 0 ("Unknown"), increment the count for
              // category value 0 ("Unknown") in the chart
              case 0:
                (!record.prsn_gndr_id || parseInt(record.prsn_gndr_id) === 0) &&
                  accumulator++;
                break;
              // For all other cases, if the gender id value matches the category value,
              // increment the count for the associated category
              default:
                record.prsn_gndr_id === `${categoryValue}` && accumulator++;
                break;
            }
            break;
          case "prsn_ethnicity_id":
            switch (categoryValue) {
              // If the ethnicity id is either missing, 5 ("Other") or 0 ("Unknown"),
              // increment the count for category value 5 ("Other or unknown") in the chart
              case 5:
                (!record.prsn_ethnicity_id ||
                  parseInt(record.prsn_ethnicity_id) === 5 ||
                  parseInt(record.prsn_ethnicity_id) === 0) &&
                  accumulator++;
                break;
              // For all other cases, if the ethnicity id value matches the category value,
              // increment the count for the associated category
              default:
                record.prsn_ethnicity_id === `${categoryValue}` &&
                  accumulator++;
                break;
            }
            break;
          default:
            break;
        }
        return accumulator;
      }, 0);
      const overallTotal = chartData[year].length;
      const percentage = (categoryTotal / overallTotal) * 100;
      const wholeNumbers = {
        categoryTotal: categoryTotal,
        overallTotal: overallTotal
      };
      // If isWholeNumber is true, return the wholeNumbers Object for display in tooltips,
      // else return percentage for chartJS to render the chart
      const data = isWholeNumber ? wholeNumbers : percentage;
      return data;
    });

  // Sort category order in stack and apply colors by averaging total demographic stats across all years in chart
  const sortAndColorData = data => {
    const averageCrashes = dataArray =>
      dataArray.reduce((a, b) => a + b) / dataArray.length;
    const dataSorted = [...data].sort(
      (a, b) => averageCrashes(b.data) - averageCrashes(a.data)
    );
    // If age is selected, keep original sorting to make chart more readable
    // For other categories, determine order of category (highest to lowest proportion)
    data = activeTab === "prsn_age" ? data : dataSorted;
    data.forEach((category, i) => {
      const color = chartColors[i];
      category.backgroundColor = color;
      category.borderColor = color;
      category.hoverBackgroundColor = color;
      category.hoverBorderColor = color;
    });
    return data;
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
      borderWidth: 2,
      label: category.label,
      data: getData(category.categoryValue, false),
      wholeNumbers: getData(category.categoryValue, true)
    }));
    return sortAndColorData(data);
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  // Set styles to override Bootstrap default styling
  const StyledButton = styled.div`
    .demographic-type {
      color: #171717;
      background: #f6f6f6 0% 0% no-repeat padding-box;
      border-style: none;
      opacity: 1;
      margin-left: 5px;
      margin-right: 5px;
    }
  `;

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="text-left, font-weight-bold">Demographics</h1>
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
      <Row className="text-center">
        <Col className="pb-2">
          <StyledButton>
            <Button
              className={classnames(
                { active: activeTab === "prsn_age" },
                "demographic-type"
              )}
              onClick={() => {
                toggle("prsn_age");
              }}
            >
              Age
            </Button>
            <Button
              className={classnames(
                { active: activeTab === "prsn_gndr_id" },
                "demographic-type"
              )}
              onClick={() => {
                toggle("prsn_gndr_id");
              }}
            >
              Sex
            </Button>
            <Button
              className={classnames(
                {
                  active: activeTab === "prsn_ethnicity_id"
                },
                "demographic-type"
              )}
              onClick={() => {
                toggle("prsn_ethnicity_id");
              }}
            >
              Race/Ethnicity
            </Button>
          </StyledButton>
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
                    let categoryTotal =
                      data.datasets[tooltipItem.datasetIndex].wholeNumbers[
                        tooltipItem.index
                      ].categoryTotal;
                    let roundedPercentage =
                      Math.round(tooltipItem.value * 100) / 100;
                    return `${label}: ${categoryTotal} (${roundedPercentage}%)`;
                  }
                }
              }
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default PeopleByDemographics;
