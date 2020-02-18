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
    { label: "Age", categoryValue: [0], color: colors.chartRed },
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

  const raceCategories = [
    { label: "Unkown", categoryValue: [0], color: colors.chartRed },
    {
      label: "White",
      categoryValue: [1],
      color: colors.chartOrange
    },
    {
      label: "Hispanic",
      categoryValue: [2],
      color: colors.chartRedOrange
    },
    { label: "Black", categoryValue: [3], color: colors.chartRed },
    {
      label: "Asian",
      categoryValue: [4],
      color: colors.chartRed
    },
    {
      label: "Other",
      categoryValue: [5],
      color: colors.chartOrange
    },
    {
      label: "American Indian or Alaska Native",
      categoryValue: [6],
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

  const [activeTab, setActiveTab] = useState("prsn_ethnicity_id");
  const [chartData, setChartData] = useState([""]); // {yearInt: [{record}, {record}, ...]}
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

  const roundNumber = (n, digits) => {
    var negative = false;
    if (digits === undefined) {
      digits = 0;
    }
    if (n < 0) {
      negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if (negative) {
      n = (n * -1).toFixed(2);
    }
    return n;
  };

  // Tabulate fatalities by demographics in data
  const getData = categoryValue =>
    yearsArray().map(year => {
      if (chartData[year]) {
        let overallTotal = chartData[year].reduce((accumulator, record) => {
          record && accumulator++;
          return accumulator;
        }, 0);
        let categoryTotal = chartData[year].reduce((accumulator, record) => {
          switch (activeTab) {
            case "prsn_age":
              break;
            case "prsn_gndr_id":
              record.prsn_gndr_id === `${categoryValue}` && accumulator++;
              break;
            case "prsn_ethnicity_id":
              record.prsn_ethnicity_id === `${categoryValue}` && accumulator++;
              break;
            default:
              break;
          }
          return accumulator;
        }, 0);
        return roundNumber((categoryTotal / overallTotal) * 100, 2);
      }
    });

  // Sort mode order in stack by averaging total mode fatalities across all years in chart
  const sortData = data => {
    const averageCrashes = dataArray =>
      dataArray.reduce((a, b) => a + b) / dataArray.length;
    return data.sort(
      (a, b) => averageCrashes(b.data) - averageCrashes(a.data)
    );
  };

  // Create dataset for each mode type, data property is an array of fatality sums sorted chronologically
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
    // Determine order of modes in each year stack
    return sortData(data);
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  // const dataAge = {
  //   labels: ["Age"],
  //   datasets: [
  //     {
  //       backgroundColor: "red",
  //       borderColor: "red",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "red",
  //       hoverBorderColor: "red",
  //       label: ["Under 18"],
  //       data: [15]
  //     },
  //     {
  //       backgroundColor: "green",
  //       borderColor: "green",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "green",
  //       hoverBorderColor: "green",
  //       label: ["18 to 44"],
  //       data: [30]
  //     },
  //     {
  //       backgroundColor: "blue",
  //       borderColor: "blue",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "blue",
  //       hoverBorderColor: "blue",
  //       label: ["45 to 64"],
  //       data: [25]
  //     },
  //     {
  //       backgroundColor: "yellow",
  //       borderColor: "yellow",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "yellow",
  //       hoverBorderColor: "yellow",
  //       label: ["65 and Over"],
  //       data: [20]
  //     }
  //   ]
  // };

  // const dataRace = {
  //   labels: ["Race"],
  //   datasets: [
  //     {
  //       backgroundColor: "red",
  //       borderColor: "red",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "red",
  //       hoverBorderColor: "red",
  //       label: ["Unknown"],
  //       data: [25]
  //     },
  //     {
  //       backgroundColor: "green",
  //       borderColor: "green",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "green",
  //       hoverBorderColor: "green",
  //       label: ["White"],
  //       data: [15]
  //     },
  //     {
  //       backgroundColor: "blue",
  //       borderColor: "blue",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "blue",
  //       hoverBorderColor: "blue",
  //       label: ["Hispanic"],
  //       data: [20]
  //     },
  //     {
  //       backgroundColor: "yellow",
  //       borderColor: "yellow",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "yellow",
  //       hoverBorderColor: "yellow",
  //       label: ["Black"],
  //       data: [10]
  //     },
  //     {
  //       backgroundColor: "pink",
  //       borderColor: "pink",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "pink",
  //       hoverBorderColor: "pink",
  //       label: ["Asian"],
  //       data: [7]
  //     },
  //     {
  //       backgroundColor: "red",
  //       borderColor: "red",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "red",
  //       hoverBorderColor: "red",
  //       label: ["Other"],
  //       data: [13]
  //     },
  //     {
  //       backgroundColor: "green",
  //       borderColor: "green",
  //       borderWidth: 2,
  //       hoverBackgroundColor: "green",
  //       hoverBorderColor: "green",
  //       label: ["American Indian or Alaska Native"],
  //       data: [10]
  //     }
  //   ]
  // };

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
                  className={classnames({ active: activeTab === "prsn_ethnicity_id" })}
                  onClick={() => {
                    toggle("prsn_ethnicity_id");
                  }}
                >
                  Race
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
