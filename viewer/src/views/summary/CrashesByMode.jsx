import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";
import { format } from "date-fns";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWalking,
  faBiking,
  faCar,
  faMotorcycle,
  faEllipsisH,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  dataEndDate,
  yearsArray,
  summaryCurrentYearEndDate,
} from "../../constants/time";
import { crashEndpointUrl } from "./queries/socrataQueries";
import { CRASH_TYPES } from "../../constants/crashTypes";
import ColorSpinner from "../../Components/Spinner/ColorSpinner";


const chartColorsBase = [
  colors.viridis1Of6Highest,
  colors.viridis2Of6,
  colors.viridis3Of6,
  colors.viridis4Of6,
  colors.viridis5Of6,
  colors.viridis6Of6Lowest,
];

const modes = [
  {
    label: "Motorist",
    icon: faCar,
    fields: {
      fatal: "motor_vehicle_death_count",
      injury: "motor_vehicle_serious_injury_count",
    },
  },
  {
    label: "Pedestrian",
    icon: faWalking,
    fields: {
      fatal: "pedestrian_death_count",
      injury: "pedestrian_serious_injury_count",
    },
  },
  {
    label: "Motorcyclist",
    icon: faMotorcycle,
    fields: {
      fatal: "motorcycle_death_count",
      injury: "motorcycle_serious_injury_count",
    },
  },
  {
    label: "Bicyclist",
    icon: faBiking,
    fields: {
      fatal: "bicycle_death_count",
      injury: "bicycle_serious_injury_count",
    },
  },
  {
    label: "E-Scooter Rider",
    icon: faMobileAlt,
    fields: {
      fatal: "micromobility_death_count",
      injury: "micromobility_serious_injury_count",
    },
  },
  {
    label: "Other",
    icon: faEllipsisH,
    fields: {
      fatal: "other_death_count",
      injury: "other_serious_injury_count",
    },
  },
];


const getModeData = (fields, chartData, crashType) =>
  yearsArray.map((year) => {
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

// Pure function — chartColors passed in, not closed over
const sortAndColorModeData = (modeData, chartColors) => {
  modeData.forEach((category, i) => {
    const color = chartColors[i];
    category.backgroundColor = color;
    category.borderColor = color;
    category.hoverBackgroundColor = color;
    category.hoverBorderColor = color;
  });
  return modeData;
};

const CrashesByMode = () => {
  const [chartData, setChartData] = useState(null); // {yearInt: [{record}, {record}, ...]}
  const [crashType, setCrashType] = useState([]);
  const [legendColors, setLegendColors] = useState([...chartColorsBase]);

  const chartRef = useRef();

  // Fetch data once — covers every crash type (fatalities and serious
  // injuries are subsets), so switching tabs never re-fetches, it just
  // re-aggregates the same records client-side in getModeData below
  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    const getChartData = async () => {
      const firstYear = yearsArray[0];
      const lastYear = yearsArray[yearsArray.length - 1];
      const endDate =
        lastYear.toString() === format(dataEndDate, "yyyy")
          ? `${summaryCurrentYearEndDate}T23:59:59`
          : `${lastYear}-12-31T23:59:59`;

      const url = `${crashEndpointUrl}?$limit=999999&$where=${CRASH_TYPES.fatalitiesAndSeriousInjuries.queryStringCrash} AND crash_timestamp_ct between '${firstYear}-01-01T00:00:00' and '${endDate}'`;

      try {
        const res = await axios.get(url, { signal: controller.signal });
        if (ignore) return; // stale response, drop it

        const newData = Object.fromEntries(yearsArray.map((y) => [y, []]));
        res.data.forEach((record) => {
          const year = new Date(record.crash_timestamp_ct).getFullYear();
          if (newData[year]) newData[year].push(record);
        });
        setChartData(newData);
      } catch (err) {
        if (!ignore && !axios.isCancel(err)) console.error(err);
      }
    };

    getChartData();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // Builds the full chart-ready object: { labels, datasets }
  const data = useMemo(() => {
    const labels = yearsArray.map((year) => `${year}`);

    if (!chartData) {
      return { labels, datasets: false };
    }

    const modeData = modes.map((mode) => ({
      borderWidth: 2,
      label: mode.label,
      icon: mode.icon,
      data: getModeData(mode.fields, chartData, crashType),
    }));

    return {
      labels,
      datasets: sortAndColorModeData(modeData, chartColorsBase),
    };
  }, [chartData, crashType]);

  const { datasets } = data;

  // Get an array of annual totals for the selected crash type
  const yearTotalsArray = useMemo(() => {
    return yearsArray.map((year, index) => {
      let currentYearTotal = 0;
      if (datasets) {
        datasets.forEach((mode) => {
          currentYearTotal += mode.data[index];
        });
      }
      return currentYearTotal;
    });
  }, [datasets]);

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

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className=" fw-bold">
            By Travel Mode <InfoPopover config={popoverConfig.summary.byMode} />
          </h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <CrashTypeSelector
            setCrashType={setCrashType}
            componentName="CrashesByMode"
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <hr />
        </Col>
      </Row>
      {data.datasets ? (
        <Row className="mt-1">
          <Col>
            <Container>
              <Row className="pb-2">
                <Col className="pe-1 col-sm-4">
                  <StyledDiv>
                    <div>
                      <p
                        className="h6 text-center my-1 pt-2"
                        style={{ height: "27px" }}
                      ></p>
                    </div>
                    {data.datasets.map((dataset, i) => {
                      const customLegendClickHandler = (datasetIndex) => {
                        if (chartRef.current) {
                          const ci = chartRef.current;
                          const meta = ci.getDatasetMeta(datasetIndex);

                          // Toggle the hidden state of the dataset
                          meta.hidden = meta.hidden === null ? true : null;

                          // Update the chart
                          ci.update();

                          // Update legend colors
                          const legendColorsClone = [...legendColors];
                          if (legendColorsClone[datasetIndex] !== "dimgray") {
                            legendColorsClone[datasetIndex] = "dimgray";
                          } else {
                            legendColorsClone[datasetIndex] = legendColorsClone[
                              datasetIndex
                            ] = chartColorsBase[datasetIndex];
                          }
                          setLegendColors(legendColorsClone);
                        }
                      };

                      return (
                        <div
                          key={i}
                          className="mode-label-div"
                          title={dataset.label}
                          onClick={() => customLegendClickHandler(i)}
                        >
                          <hr className="my-0"></hr>
                          <p className="h6 text-center my-0 py-1">
                            <FontAwesomeIcon
                              aria-hidden="true"
                              className="block-icon"
                              icon={dataset.icon}
                              color={legendColors[i]}
                            />
                            <span className="sr-only">{dataset.label}</span>
                            <span className="mode-label-text">
                              {" "}
                              {dataset.label}
                            </span>
                          </p>
                        </div>
                      );
                    })}
                    <div>
                      <hr className="my-0"></hr>
                      <p className="h6 text-center my-0 py-1">
                        <span className="sr-only">Total</span>
                        <span className="mode-label-text">Total</span>
                      </p>
                    </div>
                  </StyledDiv>
                </Col>
                {data.labels.map((year, yearIterator) => {
                  let paddingRight = yearIterator === 4 ? "null" : "pe-1";
                  return (
                    <Col key={yearIterator} className={`ps-0 ${paddingRight}`}>
                      <StyledDiv>
                        <div className="year-total-div">
                          <div>
                            <p className="h6 text-center my-1 pt-2">
                              <strong>{year}</strong>
                            </p>
                          </div>
                          {data.datasets.map((mode, modeIterator) => {
                            return (
                              <div key={modeIterator}>
                                <hr className="my-0"></hr>
                                <p className={`h6 text-center my-1`}>
                                  {mode.data[yearIterator]}
                                </p>
                              </div>
                            );
                          })}
                          <hr className="my-0"></hr>
                          <p className={`h6 text-center my-1 pb-1`}>
                            {data.datasets && yearTotalsArray[yearIterator]}
                          </p>
                        </div>
                      </StyledDiv>
                    </Col>
                  );
                })}
              </Row>
            </Container>
            {
              <Container>
                <Bar
                  ref={chartRef}
                  data={data}
                  height={null}
                  width={null}
                  aria-label="Stacked bar chart showing crash fatalities or injuries by travel mode over time"
                  options={{
                    responsive: true,
                    aspectRatio: 1.37,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: true,
                      },

                      y: {
                        stacked: true,
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </Container>
            }
          </Col>
        </Row>
      ) : (
        <h1>
          <ColorSpinner />
        </h1>
      )}
    </Container>
  );
};

export default CrashesByMode;
