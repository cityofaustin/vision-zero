import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWalking,
  faBiking,
  faCar,
  faMotorcycle,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";

const CrashesByMode = props => {
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

  useEffect(() => {
    !!chartRef.current &&
      !!chartData &&
      setChartLegend(chartRef.current.chartInstance.generateLegend());
  }, [chartData, legendColors]);

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
      border-radius: 4px;
      border-style: none;
    }

    .mode-label-text {
      display: none;
      @media (min-width: 576px) {
        display: inline;
      }
    }

    .sr-only {
      display: hidden;
    }
  `;

  useEffect(() => {
    const iconsDict = {
      Motorist: faCar,
      Pedestrian: faWalking,
      Motorcyclist: faMotorcycle,
      Bicyclist: faBiking,
      Other: faEllipsisH,
    };

    const buildOptions = (mode, index) => {
      const color = legendColors[index];
      return {
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        hoverBackgroundColor: color,
        hoverBorderColor: color,
        icon: iconsDict[mode],
        label: mode,
      };
    };

    const collector = mode => {
      switch (mode.name) {
        case "fatalities":
          return a => a.death_cnt;
        case "seriousInjuries":
          return a => a.sus_serious_injry_cnt;
        default:
          return a => a.death_cnt + a.sus_serious_injry_cnt;
      }
    };

    // Available modes sorted by average number of fatalities high-to-low
    const availableModes = [...new Set(props.data.map(x => x.unit_desc))]
      .map(mode => {
        const yearlyTotal = props.data
          .filter(i => i.unit_desc === mode)
          .map(i => i.death_cnt);
        const avg = yearlyTotal.reduce((a, b) => a + b) / yearlyTotal.length;
        return { mode, avg };
      })
      .sort((a, b) => b.avg - a.avg)
      .map(i => i.mode);

    // Generate the dataset by loop
    const dataset = availableModes.map((mode, index) => {
      return {
        ...buildOptions(mode, index),
        data: props.data
          .filter(i => i.unit_desc === mode)
          .map(collector(crashType)),
      };
    });

    // Change the current data
    setChartData(dataset);
  }, [legendColors, crashType, props.data]);

  const data = {
    labels: [...new Set(props.data.map(x => x.year))].map(x => String(x)),
    datasets: !!chartData && chartData,
  };

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className="text-left, font-weight-bold">By Travel Mode</h2>
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
            <Container>
              <Bar
                ref={ref => (chartRef.current = ref)}
                data={data}
                height={null}
                width={null}
                options={{
                  responsive: true,
                  aspectRatio: 1.37,
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
                  legendCallback: function(chart) {
                    return (
                      <Row className="pb-2">
                        <Col className="pr-1 col-sm-4">
                          <StyledDiv>
                            <div>
                              <p
                                className="h6 text-center my-1 pt-2"
                                style={{ height: "27px" }}
                              ></p>
                            </div>
                            {chart.data.datasets.map((dataset, i) => {
                              const updateLegendColors = () => {
                                const legendColorsClone = [...legendColors];
                                legendColors[i] !== "dimgray"
                                  ? legendColorsClone.splice(i, 1, "dimgray")
                                  : legendColorsClone.splice(
                                      i,
                                      1,
                                      chartColors[i]
                                    );
                                setLegendColors(legendColorsClone);
                              };

                              const customLegendClickHandler = () => {
                                const legendItem = chart.legend.legendItems[i];
                                const index = legendItem.datasetIndex;
                                const ci = chartRef.current.chartInstance.chart;
                                const meta = ci.getDatasetMeta(index);

                                // See controller.isDatasetVisible comment
                                meta.hidden =
                                  meta.hidden === null
                                    ? !ci.data.datasets[index].hidden
                                    : null;

                                // We hid a dataset ... rerender the chart,
                                // then update the legend colors
                                updateLegendColors(ci.update());
                              };

                              return (
                                <div
                                  key={i}
                                  className="mode-label-div"
                                  title={dataset.label}
                                  onClick={customLegendClickHandler}
                                >
                                  <hr className="my-0"></hr>
                                  <h3 className="h6 text-center my-0 py-1">
                                    <FontAwesomeIcon
                                      aria-hidden="true"
                                      className="block-icon"
                                      icon={dataset.icon}
                                      color={legendColors[i]}
                                    />
                                    <span className="sr-only">
                                      {dataset.label}
                                    </span>
                                    <p className="mode-label-text">
                                      {" "}
                                      {dataset.label}
                                    </p>
                                  </h3>
                                </div>
                              );
                            })}
                          </StyledDiv>
                        </Col>
                        {chart.data.labels.map((year, yearIterator) => {
                          let paddingRight =
                            yearIterator === 4 ? "null" : "pr-1";
                          return (
                            <Col
                              key={yearIterator}
                              className={`pl-0 ${paddingRight}`}
                            >
                              <StyledDiv>
                                <div className="year-total-div">
                                  <div>
                                    <h4 className="h6 text-center my-1 pt-2">
                                      <strong>{year}</strong>
                                    </h4>
                                  </div>
                                  {chart.data.datasets.map(
                                    (mode, modeIterator) => {
                                      let paddingBottom =
                                        modeIterator === 4 ? "pb-1" : "pb-0";
                                      return (
                                        <div key={modeIterator}>
                                          <hr className="my-0"></hr>
                                          <h4
                                            className={`h6 text-center my-1 ${paddingBottom}`}
                                          >
                                            {mode.data[yearIterator]}
                                          </h4>
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
            </Container>
          }
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByMode;
