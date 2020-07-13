import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { crashEndpointUrl } from "./queries/socrataQueries";
import {
  dataEndDate,
  summaryCurrentYearEndDate,
  yearsArray,
} from "../../constants/time";
import { colors } from "../../constants/colors";

const CrashesByMonth = props => {
  // Set years order ascending
  const chartYearsArray = yearsArray().sort((a, b) => b - a);

  const chartColors = [
    colors.viridis1Of6Highest,
    colors.viridis2Of6,
    colors.viridis3Of6,
    colors.viridis4Of6,
    colors.viridis5Of6,
  ];

  const [chartData, setChartData] = useState(null); // {yearInt: [monthTotal, monthTotal, ...]}
  const [crashType, setCrashType] = useState([]);
  const [chartLegend, setChartLegend] = useState(null);
  const [legendColors, setLegendColors] = useState([...chartColors].reverse());

  const chartRef = useRef();

  useEffect(() => {
    !!chartRef.current &&
      !!chartData &&
      setChartLegend(chartRef.current.chartInstance.generateLegend());
  }, [chartData, legendColors]);


  useEffect(() => {
    const currentValueByMode = (mode, accumulator, node) => {
      const acc = accumulator.slice(-1).pop() || 0;
      switch (mode) {
        case "fatalities":
        {
          return acc + node.death_cnt;
        }
          break;
        case "seriousInjuries":
        {
          return acc + node.sus_serious_injry_cnt;
        }
          break;
        default: {
          return (
            acc + node.death_cnt + node.sus_serious_injry_cnt
          );
        }
      }
    };

    const newData = props.data.reduce((accumulator, currentNode, index) => {
      if (index === 1) {
        const originalAcc = currentValueByMode(crashType.name,[], accumulator);
        accumulator = {};
        accumulator[currentNode.year] = [];
        accumulator[currentNode.year].push(originalAcc);
        accumulator[currentNode.year].push(
          currentValueByMode(crashType.name, accumulator[currentNode.year], currentNode)
        );
        return accumulator;
      }

      // Otherwise, we proceed as normal...
      if (!Array.isArray(accumulator[currentNode.year]))
        accumulator[currentNode.year] = [];

      accumulator[currentNode.year].push(
        currentValueByMode(crashType.name, accumulator[currentNode.year], currentNode)
      );
      return accumulator;
    });

    setChartData(newData);
  }, [crashType]);

  // Create dataset for each year, data property is an array of cumulative totals by month
  const createDatasets = () => {
    const chartDatasets = chartYearsArray.map((year, i) => ({
      label: year,
      fill: false,
      lineTension: 0.1,
      backgroundColor: chartColors[i], // Legend box
      borderColor: chartColors[i],
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: chartColors[i],
      pointBackgroundColor: chartColors[i],
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: chartColors[i],
      pointHoverBorderColor: chartColors[i],
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: chartData[year],
    }));

    return chartDatasets;
  };

  // Build data objects
  const data = {
    labels: moment.monthsShort(),
    datasets: !!chartData && createDatasets(),
  };

  const StyledDiv = styled.div`
    .year-total-div {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-radius: 4px;
      border-style: none;
      opacity: 1;
    }

    .year-total-div:hover {
      cursor: pointer;
      color: ${colors.buttonBackground};
      background: dimgray 0% 0% no-repeat padding-box;
    }
  `;

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className="text-left font-weight-bold">By Month/Year</h2>
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
            // Wrapping the chart in a div prevents it from getting caught in a rerendering loop
            <Container>
              <Line
                ref={ref => (chartRef.current = ref)}
                data={data}
                height={null}
                width={null}
                options={{
                  responsive: true,
                  aspectRatio: 1.16,
                  maintainAspectRatio: false,
                  tooltips: {
                    mode: "x",
                  },
                  legend: {
                    display: false,
                  },
                  legendCallback: function(chart) {
                    return (
                      <Row className="pb-2">
                        <Col xs={4} s={2} m={2} l={2} xl={2}>
                          <div>
                            <hr
                              className="my-1"
                              style={{
                                border: `4px solid ${colors.buttonBackground}`,
                              }}
                            ></hr>
                            <h3 className="h6 text-center py-1 mb-0">
                              <strong>Year</strong>
                            </h3>
                            <hr className="my-1"></hr>
                            <h3 className="h6 text-center py-1">Total</h3>
                          </div>
                        </Col>
                        {// Reverse data and colors arrays and render so they appear chronologically
                        [...chartYearsArray].reverse().map((year, i) => {
                          const yearTotalData = chartData[year];
                          const yearTotal =
                            yearTotalData[yearTotalData.length - 1];
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
                                  chartColors.reverse()[i]
                                );
                            setLegendColors(legendColorsClone);
                          };

                          const customLegendClickHandler = () => {
                            const legendItems = [
                              ...chart.legend.legendItems,
                            ].reverse();
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
                            <Col xs={4} s={2} m={2} l={2} xl={2} key={i}>
                              <StyledDiv>
                                <div
                                  className="year-total-div"
                                  onClick={customLegendClickHandler}
                                >
                                  <hr
                                    className="my-1"
                                    style={{
                                      border: `4px solid ${legendColor}`,
                                    }}
                                  ></hr>
                                  <h4 className="h6 text-center py-1 mb-0">
                                    <strong>{!!chartData && year}</strong>
                                  </h4>
                                  <hr className="my-1"></hr>
                                  <h4 className="h6 text-center py-1">
                                    {!!chartData && yearTotal}
                                  </h4>
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
            </Container>
          }
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByMonth;
