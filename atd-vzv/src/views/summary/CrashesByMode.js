import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";
import {
  dataEndDate,
  yearsArray,
  summaryCurrentYearEndDate,
} from "../../constants/time";
import { crashEndpointUrl } from "./queries/socrataQueries";

const CrashesByMode = () => {
  const modes = [
    {
      label: "Motorist",
      fields: {
        fatal: `motor_vehicle_death_count`,
        injury: `motor_vehicle_serious_injury_count`,
      },
    },
    {
      label: "Pedestrian",
      fields: {
        fatal: `pedestrian_death_count`,
        injury: `pedestrian_serious_injury_count`,
      },
    },
    {
      label: "Motorcyclist",
      fields: {
        fatal: `motorcycle_death_count`,
        injury: `motorcycle_serious_injury_count`,
      },
    },
    {
      label: "Bicyclist",
      fields: {
        fatal: `bicycle_death_count`,
        injury: `bicycle_serious_injury_count`,
      },
    },
    {
      label: "Other",
      fields: {
        fatal: `other_death_count`,
        injury: `other_serious_injury_count`,
      },
    },
  ];

  const chartColors = [
    colors.viridis1Of6Highest,
    colors.viridis2Of6,
    colors.viridis3Of6,
    colors.viridis4Of6,
    colors.viridis5Of6,
  ];

  const [chartData, setChartData] = useState(null); // {yearInt: [{record}, {record}, ...]}
  const [crashType, setCrashType] = useState([]);
  const [chartLegend, setChartLegend] = useState(null);
  const [legendColors, setLegendColors] = useState([...chartColors]);

  const chartRef = useRef();

  // Fetch data and set in state by years in yearsArray
  useEffect(() => {
    // Wait for crashType to be passed up from setCrashType component
    if (crashType.queryStringPerson) {
      const getChartData = async () => {
        let newData = {};
        // Use Promise.all to let all requests resolve before setting chart data by year
        await Promise.all(
          yearsArray().map(async (year) => {
            // If getting data for current year (only including years past January), set end of query to last day of previous month,
            // else if getting data for previous years, set end of query to last day of year
            let endDate =
              year.toString() === dataEndDate.format("YYYY")
                ? `${summaryCurrentYearEndDate}T23:59:59`
                : `${year}-12-31T23:59:59`;
            let url = `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
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

  useEffect(() => {
    !!chartRef.current &&
      !!chartData &&
      setChartLegend(chartRef.current.chartInstance.generateLegend());
  }, [chartData, legendColors]);

  const createChartLabels = () => yearsArray().map((year) => `${year}`);

  // Tabulate fatalities/injuries by mode fields in data
  const getModeData = (fields) =>
    yearsArray().map((year) => {
      return chartData[year].reduce((accumulator, record) => {
        const isFatalQuery =
          crashType.name === "fatalities" ||
          crashType.name === "fatalitiesAndSeriousInjuries";
        const isInjuryQuery =
          crashType.name === "seriousInjuries" ||
          crashType.name === "fatalitiesAndSeriousInjuries";

        accumulator += isFatalQuery && parseInt(record[fields.fatal]);
        accumulator += isInjuryQuery && parseInt(record[fields.injury]);

        return accumulator;
      }, 0);
    });

  // Sort mode order in stack and apply colors by averaging total mode fatalities across all years in chart
  const sortAndColorModeData = (modeData) => {
    const averageModeFatalities = (modeDataArray) =>
      modeDataArray.reduce((a, b) => a + b) / modeDataArray.length;
    const modeDataSorted = modeData.sort(
      (a, b) => averageModeFatalities(b.data) - averageModeFatalities(a.data)
    );
    modeDataSorted.forEach((category, i) => {
      const color = chartColors[i];
      category.backgroundColor = color;
      category.borderColor = color;
      category.hoverBackgroundColor = color;
      category.hoverBorderColor = color;
    });
    return modeDataSorted;
  };

  // Create dataset for each mode type, data property is an array of fatality sums sorted chronologically
  const createTypeDatasets = () => {
    const modeData = modes.map((mode) => ({
      borderWidth: 2,
      label: mode.label,
      data: getModeData(mode.fields),
    }));
    // Determine order of modes in each year stack and color appropriately
    return sortAndColorModeData(modeData);
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets(),
  };

  const StyledDiv = styled.div`
    .year-total-div {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-radius: 4px;
      border-style: none;
      opacity: 1;
    }

    .mode-label-div:hover {
      cursor: pointer;
      color: ${colors.buttonBackground};
      background: dimgray 0% 0% no-repeat padding-box;
    }
  `;

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className="text-left, font-weight-bold">By Mode</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
      <Row>
        <Col>
          <hr className="mb-2" />
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          {chartLegend}
          {
            <div>
              <Bar
                ref={(ref) => (chartRef.current = ref)}
                data={data}
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
                      },
                    ],
                    yAxes: [
                      {
                        stacked: true,
                      },
                    ],
                  },
                  legend: {
                    display: false,
                  },
                  legendCallback: function (chart) {
                    return (
                      <Row className="pb-2">
                        <Col className="pr-1">
                          <StyledDiv>
                            <div>
                              <h6 className="text-center pt-2">
                                {"\u00A0"}
                              </h6>
                            </div>
                            {modes.map((mode, i) => {
                              const legendColor = legendColors[i];

                              const updateLegendColors = () => {
                                const legendColorsClone = [...legendColors];
                                legendColor !== colors.buttonBackground
                                  ? legendColorsClone.splice(
                                      i,
                                      1,
                                      colors.buttonBackground
                                    )
                                  : legendColorsClone.splice(
                                      i,
                                      1,
                                      chartColors[i]
                                    );
                                setLegendColors(legendColorsClone);
                              };

                              const customLegendClickHandler = () => {
                                const legendItems = [
                                  ...chart.legend.legendItems,
                                ];
                                const legendItem = legendItems[i];
                                const index = legendItem.datasetIndex;
                                const ci = chartRef.current.chartInstance.chart;
                                const meta = ci.getDatasetMeta(index);

                                // See controller.isDatasetVisible comment
                                meta.hidden =
                                  meta.hidden === null
                                    ? !ci.data.datasets[index].hidden
                                    : null;

                                // We hid a dataset ... rerender the chart
                                ci.update();

                                // Update legend colors to show data has been hidden
                                updateLegendColors();
                              };

                              return (
                                <div
                                  key={i}
                                  className="mode-label-div"
                                  style={{
                                    borderRight: `8px solid ${legendColor}`,
                                  }}
                                  onClick={customLegendClickHandler}
                                >
                                  <hr className="my-0"></hr>
                                  <h6 className="text-center mx-1 my-0 pt-1 pb-1">
                                    {mode.label}
                                  </h6>
                                </div>
                              );
                            })}
                          </StyledDiv>
                        </Col>
                        {chart.data.labels.map((year, yearIterator) => {
                          let paddingRight =
                          yearIterator === 4 ? null : "pr-1";                          
                          return (
                            <Col key={yearIterator} className={`pl-0 ${paddingRight}`}>
                              <StyledDiv>
                                <div className="year-total-div">
                                  <div>
                                    <h6 className="text-center my-1 pt-2">
                                      <strong>{year}</strong>
                                    </h6>
                                  </div>
                                  {chart.data.datasets.map(
                                    (mode, modeIterator) => {
                                      let paddingBottom =
                                        modeIterator === 4 ? "pb-1" : "pb-0";
                                      return (
                                        <div key={modeIterator}>
                                          <hr className="my-0"></hr>
                                          <h6
                                            className={`text-center my-1 ${paddingBottom}`}
                                          >
                                            {mode.data[yearIterator]}
                                          </h6>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </StyledDiv>
                            </Col>
                          );
                        })}
                      </Row>
                    );
                  },
                }}
              />
            </div>
          }
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByMode;
