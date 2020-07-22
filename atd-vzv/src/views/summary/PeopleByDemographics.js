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
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";

import clonedeep from "lodash.clonedeep";

const PeopleByDemographics = (props) => {

  const ageCategories = [
    {
      label: "Under 18",
      categoryValue: 1
    },
    {
      label: "18 to 44",
      categoryValue: 2,
    },
    {
      label: "45 to 64",
      categoryValue: 3,
    },
    {
      label: "65 and older",
      categoryValue: 4,
    },
    {
      label: "Unknown",
      categoryValue: 0,
    },
  ];

  const sexCategories = [
    {
      label: "Male",
      categoryValue: 1,
    },
    {
      label: "Female",
      categoryValue: 2,
    },
    {
      label: "Unknown",
      categoryValue: 0,
    },
  ];

  const raceCategories = [
    {
      label: "White",
      categoryValue: 1,
    },
    {
      label: "Hispanic",
      categoryValue: 2,
    },
    { label: "Black", categoryValue: 3 },
    {
      label: "Asian",
      categoryValue: 4,
    },
    {
      label: "Other or unknown",
      categoryValue: 5,
    },
    {
      label: "American Indian or Alaska Native",
      categoryValue: 6,
    },
  ];

  const chartColors = [
    colors.viridis1Of6Highest,
    colors.viridis2Of6,
    colors.viridis3Of6,
    colors.viridis4Of6,
    colors.viridis5Of6,
    colors.viridis6Of6Lowest,
  ];

  const [activeTab, setActiveTab] = useState("prsn_ethnicity_id");
  const [chartData, setChartData] = useState(null); // {yearInt: [{record}, {record}, ...]}
  const [crashType, setCrashType] = useState([]);
  const [newChartData, setNewChartData] = useState(null);

  const toggle = (tab) => {
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
          yearsArray().map(async (year) => {
            // If getting data for current year (only including years past January),
            // set end of query to last day of previous month,
            // else if getting data for previous years, set end of query to last day of year
            let endDate =
              year.toString() === dataEndDate.format("YYYY")
                ? `${dataEndDate.format("YYYY-MM-DD")}T23:59:59`
                : `${year}-12-31T23:59:59`;
            let url = `${personEndpointUrl}?$where=${crashType.queryStringPerson} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
            await axios.get(url).then((res) => {
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

  const createChartLabels = () => yearsArray().map((year) => `${year}`);

  // Tabulate crashes by demographics in data
  const getData = (categoryValue, isWholeNumber) =>
    yearsArray().map((year) => {
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
        overallTotal: overallTotal,
      };
      // If isWholeNumber is true, return the wholeNumbers Object for display in tooltips,
      // else return percentage for chartJS to render the chart
      const data = isWholeNumber ? wholeNumbers : percentage;
      return data;
    });

  // Sort category order in stack and apply colors by averaging total demographic stats across all years in chart
  const sortAndColorData = (data) => {
    const averageCrashes = (dataArray) =>
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
    const data = categories.map((category) => ({
      borderWidth: 2,
      label: category.label,
      data: getData(category.categoryValue, false),
      wholeNumbers: getData(category.categoryValue, true),
    }));
    return sortAndColorData(data);
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets(),
  };

  // Set styles to override Bootstrap default styling
  const StyledButton = styled.div`
    .demographic-type {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-style: none;
      opacity: 1;
      margin-left: 5px;
      margin-right: 5px;
    }
  `;

  useEffect(() => {
    const chartConfig = {
      prsn_age: {
        under_18: {
          label: "Under 18",
          categoryValue: 1
        },
        from_18_to_44: {
          label: "18 to 44",
          categoryValue: 2,
        },
        from_45_to_64: {
          label: "45 to 64",
          categoryValue: 3,
        },
        from_65: {
          label: "65 and older",
          categoryValue: 4,
        },
        unknown: {
          label: "Unknown",
          categoryValue: 0,
        },
      },
      prsn_gndr_id: {
        gender_male: {
          label: "Male",
          categoryValue: 1,
        },
        gender_female: {
          label: "Female",
          categoryValue: 2,
        },
        gender_unknown: {
          label: "Unknown",
          categoryValue: 0,
        },
      },
      prsn_ethnicity_id: {
        ethn_white: {
          label: "White",
          categoryValue: 1,
        },
        ethn_hispanic: {
          label: "Hispanic",
          categoryValue: 2,
        },
        ethn_black: {
          label: "Black",
          categoryValue: 3
        },
        ethn_asian: {
          label: "Asian",
          categoryValue: 4,
        },
        ethn_other: {
          label: "Other or unknown",
          categoryValue: 5,
        },
        ethn_amer_ind_nat: {
          label: "American Indian or Alaska Native",
          categoryValue: 6,
        },
      }
    };

    const chartColors = [
      colors.viridis1Of6Highest,
      colors.viridis2Of6,
      colors.viridis3Of6,
      colors.viridis4Of6,
      colors.viridis5Of6,
      colors.viridis6Of6Lowest,
    ];

    const mergeNodes = (a, b) => {
      const output = {...a};
      output.type = "all";
      output.under_18 += b.under_18;
      output.from_18_to_44 += b.from_18_to_44;
      output.from_45_to_64 += b.from_45_to_64;
      output.from_65 += b.from_65;
      output.unknown += b.unknown;

      output.gender_male += b.gender_male;
      output.gender_female += b.gender_female;
      output.gender_unknown += b.gender_unknown;

      output.ethn_white += b.ethn_white;
      output.ethn_hispanic += b.ethn_hispanic;
      output.ethn_black += b.ethn_black;
      output.ethn_asian += b.ethn_asian;
      output.ethn_other += output.eth_unknown + b.ethn_other + b.eth_unknown;
      output.ethn_amer_ind_nat += b.ethn_amer_ind_nat;

      output.total += b.total;
      console.log("Finished merging nodes...");
      return output;
    }

    const includeNodeCategory = (nodeType) => {
      switch (crashType.name) {
        case "fatalities":
          return nodeType === "fatalities";
        case "seriousInjuries":
          return nodeType === "serious_injuries";
        default:
          return true;
      }
    }

    const tabsList = {
      "prsn_ethnicity_id": [
        "ethn_white",
        "ethn_hispanic",
        "ethn_black",
        "ethn_asian",
        "ethn_other",
        "ethn_amer_ind_nat",
        "eth_unknown",
      ],
      "prsn_gndr_id": [
        "gender_male",
        "gender_female",
        "gender_unknown",
      ],
      "prsn_age": [
        "under_18",
        "from_18_to_44",
        "from_45_to_64",
        "from_65",
        "unknown",
      ],
    }

    const removeUnusedTabs = (node) => {
      // Delete all unnecessary keys

      for (const key in Object.keys(node)) {
        if (!tabsList[activeTab].includes(key || key === "removeUnusedTabs"))
          delete node[key];
      }

      return node;
    }

    const buildOptions = (key) => {
      if (key === "total") return {};
      const color = chartColors[chartConfig[activeTab][key]["categoryValue"]-1];
      const label = chartConfig[activeTab][key]["label"];
      return {
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        hoverBackgroundColor: color,
        hoverBorderColor: color,
        label: label,
      };
    };



    // Filter based on the categories we need: all, fatalities, ssi
    let rawData = props.data.filter(item => {
      return includeNodeCategory(item.type);
    });

    // If we have all, then add up by year
    if(rawData.length > 5) {
      let finalData = [];
      for (let n = 0; n < rawData.length; n += 2)
        finalData[(n / 2) || 0] = mergeNodes(rawData[n], rawData[n+1]);
      rawData = finalData;
    }

    const rawDataOriginal = clonedeep(rawData);

    const getTotalsForKey = (key) => {
      return rawDataOriginal.map(item => item[key])
    };

    const getWholeNums = (key) => {
      return rawDataOriginal.map(item => {
        return {
          categoryTotal: item[key],
          overallTotal: item["total"]
        }
      });
    };

    rawData = rawData.map(item => {
      return removeUnusedTabs(item);
    });

    rawData = {
      datasets: tabsList[activeTab].filter(k => k !== "eth_unknown").map((key, i) => {
        const total = getTotalsForKey("total");
        return {
          ...buildOptions(key),
          data: rawData.map((item, i) => {
            const output = (item[key]/total[i]) * 100;
            console.log(key, item[key], total[i], output);
            return output;
          }),
          wholeNumbers: getWholeNums(key),
        }
      }),
      labels: rawDataOriginal.map(item => String(item.year)),
    };

    setNewChartData(rawData);
  }, [crashType, activeTab, props.data]);

  console.log("Data", data);
  console.log("newChartData", newChartData);



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
      <Row className="text-center">
        <Col className="pb-2">
          <StyledButton>
            <Button
              className={classnames(
                {
                  active: activeTab === "prsn_ethnicity_id",
                },
                "demographic-type"
              )}
              onClick={() => {
                toggle("prsn_ethnicity_id");
              }}
            >
              Race/Ethnicity
            </Button>
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
              Gender
            </Button>
          </StyledButton>
        </Col>
      </Row>
      <Row>
        <Col>
          <HorizontalBar
            data={newChartData}
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
