import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";
import {
  dataEndDate,
  yearsArray,
  summaryCurrentYearEndDate
} from "../../constants/time";
import { crashEndpointUrl } from "./queries/socrataQueries";

const FatalitiesByMode = () => {
  const modes = [
    {
      label: "Motorist",
      fields: {
        fatal: `motor_vehicle_death_count`,
        injury: `motor_vehicle_serious_injury_count`
      },
      color: colors.chartRed
    },
    {
      label: "Pedestrian",
      fields: {
        fatal: `pedestrian_death_count`,
        injury: `pedestrian_serious_injury_count`
      },
      color: colors.chartOrange
    },
    {
      label: "Motorcyclist",
      fields: {
        fatal: `motorcycle_death_count`,
        injury: `motorcycle_serious_injury_count`
      },
      color: colors.chartRedOrange
    },
    {
      label: "Bicyclist",
      fields: {
        fatal: `bicycle_death_count`,
        injury: `bicycle_serious_injury_count`
      },
      color: colors.chartBlue
    },
    {
      label: "Other",
      fields: {
        fatal: `other_death_count`,
        injury: `other_serious_injury_count`
      },
      color: colors.chartLightBlue
    }
  ];

  const [chartData, setChartData] = useState(null); // {yearInt: [{record}, {record}, ...]}
  const [crashType, setCrashType] = useState([]);

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
              year.toString() === dataEndDate.format("YYYY")
                ? `${summaryCurrentYearEndDate}T23:59:59`
                : `${year}-12-31T23:59:59`;
            let url = `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
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

  // Tabulate fatalities/injuries by mode flags in data
  const getModeData = fields =>
    yearsArray().map(year => {
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

  // Sort mode order in stack by averaging total mode fatalities across all years in chart
  const sortModeData = modeData => {
    const averageModeFatalities = modeDataArray =>
      modeDataArray.reduce((a, b) => a + b) / modeDataArray.length;
    return modeData.sort(
      (a, b) => averageModeFatalities(b.data) - averageModeFatalities(a.data)
    );
  };

  // Create dataset for each mode type, data property is an array of fatality sums sorted chronologically
  const createTypeDatasets = () => {
    const modeData = modes.map(mode => ({
      backgroundColor: mode.color,
      borderColor: mode.color,
      borderWidth: 2,
      hoverBackgroundColor: mode.color,
      hoverBorderColor: mode.color,
      label: mode.label,
      data: getModeData(mode.fields)
    }));
    // Determine order of modes in each year stack
    return sortModeData(modeData);
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  return (
    <Container>
      <Row className="pb-3">
        <Col>
          <h3 className="text-center">{crashType.textString} by Mode</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <Bar
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
      <Row>
        <Col>
          <p className="text-center">
            Data Through: {dataEndDate.format("MMMM YYYY")}
          </p>
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

export default FatalitiesByMode;
