import React, { useEffect, useState } from "react";
import { HorizontalBar } from "react-chartjs-2";
import ChartTypeSelector from "./Components/ChartTypeSelector";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import { colors } from "../../constants/colors";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";

import clonedeep from "lodash.clonedeep";

const PeopleByDemographics = props => {
  const [activeTab, setActiveTab] = useState("prsn_ethnicity_id");
  const [crashType, setCrashType] = useState([]);
  const [chartData, setChartData] = useState(null);

  const toggle = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
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
          categoryValue: 1,
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
          categoryValue: 5,
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
          categoryValue: 5,
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
          categoryValue: 3,
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
      },
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
      const output = { ...a };
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
      output.ethn_other += b.ethn_other;
      output.ethn_amer_ind_nat += b.ethn_amer_ind_nat;

      output.total += b.total;
      return output;
    };

    const includeNodeCategory = nodeType => {
      switch (crashType.name) {
        case "fatalities":
          return nodeType === "fatalities";
        case "seriousInjuries":
          return nodeType === "serious_injuries";
        default:
          return true;
      }
    };

    const tabsList = {
      prsn_ethnicity_id: [
        "ethn_white",
        "ethn_hispanic",
        "ethn_black",
        "ethn_asian",
        "ethn_other",
        "ethn_amer_ind_nat",
      ],
      prsn_gndr_id: ["gender_male", "gender_female", "gender_unknown"],
      prsn_age: [
        "under_18",
        "from_18_to_44",
        "from_45_to_64",
        "from_65",
        "unknown",
      ],
    };

    const removeUnusedTabs = node => {
      // Delete all unnecessary keys

      for (const key in Object.keys(node)) {
        if (!tabsList[activeTab].includes(key || key === "removeUnusedTabs"))
          delete node[key];
      }

      return node;
    };

    const buildOptions = key => {
      if (key === "total") return {};
      const color =
        chartColors[chartConfig[activeTab][key]["categoryValue"] - 1];
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
    if (rawData.length > 5) {
      let finalData = [];
      for (let n = 0; n < rawData.length; n += 2)
        finalData[n / 2 || 0] = mergeNodes(rawData[n], rawData[n + 1]);
      rawData = finalData;
    }

    const rawDataOriginal = clonedeep(rawData);

    const getTotalsForKey = key => {
      return rawDataOriginal.map(item => item[key]);
    };

    const getWholeNums = key => {
      return rawDataOriginal.map(item => {
        return {
          categoryTotal: item[key],
          overallTotal: item["total"],
        };
      });
    };

    rawData = rawData.map(item => {
      return removeUnusedTabs(item);
    });

    rawData = {
      datasets: tabsList[activeTab]
        .filter(k => k !== "eth_unknown")
        .map((key, i) => {
          const total = getTotalsForKey("total");
          return {
            ...buildOptions(key),
            data: rawData.map((item, i) => {
              return (item[key] / total[i]) * 100;
            }),
            wholeNumbers: getWholeNums(key),
          };
        }),
      labels: rawDataOriginal.map(item => String(item.year)),
    };

    setChartData(rawData);
  }, [crashType, activeTab, props.data]);

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
        chartTypes={chartTypes}
        chartType={chartType}
        setChartType={setChartType}
      />
      <Row>
        <Col>
          <HorizontalBar
            data={chartData}
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
                  label: function(tooltipItem, data) {
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
