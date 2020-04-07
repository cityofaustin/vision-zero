import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryWidget from "../../Components/Widgets/SummaryWidget";
import { Row, Col } from "reactstrap";

import {
  summaryCurrentYearStartDate,
  summaryCurrentYearEndDate,
  summaryLastYearStartDate,
  summaryLastYearEndDate,
} from "../../constants/time";
import { personEndpointUrl, crashEndpointUrl } from "./queries/socrataQueries";
import {
  calculateTotalFatalities,
  getYearsOfLifeLost,
  calculateTotalInjuriesOfCurrentAndPrevYear,
  calculateTotalCrashes,
} from "./helpers/helpers";
import { colors } from "../../constants/colors";
import {
  faCar,
  faHourglassHalf,
  faHeartbeat,
  faMedkit,
} from "@fortawesome/free-solid-svg-icons";

const SummaryView = () => {
  const [fatalities, setFatalities] = useState(null);
  const [yearsOfLifeLost, setYearsOfLifeLost] = useState(null);
  const [seriousInjuries, setSeriousInjuries] = useState(null);
  const [totalCrashes, setTotalCrashes] = useState(null);

  const [fatalitiesLastYear, setFatalitiesLastYear] = useState(null);
  const [yearsOfLifeLostLastYear, setYearsOfLifeLostLastYear] = useState(null);
  const [seriousInjuriesLastYear, setSeriousInjuriesLastYear] = useState(null);
  const [totalCrashesLastYear, setTotalCrashesLastYear] = useState(null);

  useEffect(() => {
    const fatalitiesUrl = `${crashEndpointUrl}?$where=death_cnt > 0 AND crash_date between '${summaryCurrentYearStartDate}T00:00:00' and '${summaryCurrentYearEndDate}T23:59:59'`;
    const yearsOfLifeLostUrl = `${personEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${summaryCurrentYearStartDate}T00:00:00' and '${summaryCurrentYearEndDate}T23:59:59'`;
    const seriousInjuriesUrl = `${crashEndpointUrl}?$where=(sus_serious_injry_cnt > 0 AND crash_date between '${summaryCurrentYearStartDate}T00:00:00' and '${summaryCurrentYearEndDate}T23:59:59') OR (sus_serious_injry_cnt > 0 AND crash_date between '${summaryLastYearStartDate}T00:00:00' and '${summaryLastYearEndDate}T23:59:59')`;
    const totalCrashesUrl = `${crashEndpointUrl}?$where=crash_date between '${summaryCurrentYearStartDate}T00:00:00' and '${summaryCurrentYearEndDate}T23:59:59'&$limit=100000`;

    const fatalitiesLastYearUrl = `${crashEndpointUrl}?$where=death_cnt > 0 AND crash_date between '${summaryLastYearStartDate}T00:00:00' and '${summaryLastYearEndDate}T23:59:59'`;
    const yearsOfLifeLostLastYearUrl = `${personEndpointUrl}?$where=prsn_injry_sev_id = '4' AND crash_date between '${summaryLastYearStartDate}T00:00:00' and '${summaryLastYearEndDate}T23:59:59'`;
    const seriousInjuriesLastYearUrl = `${crashEndpointUrl}?$where=sus_serious_injry_cnt > 0 AND crash_date between '${summaryLastYearStartDate}T00:00:00' and '${summaryLastYearEndDate}T23:59:59'`;
    const totalCrashesLastYearUrl = `${crashEndpointUrl}?$where=crash_date between '${summaryLastYearStartDate}T00:00:00' and '${summaryLastYearEndDate}T23:59:59'&$limit=100000`;

    // axios.get(fatalitiesUrl).then((res) => {
    //   setFatalities(calculateTotalFatalities(res.data));
    // });

    // axios.get(yearsOfLifeLostUrl).then((res) => {
    //   setYearsOfLifeLost(getYearsOfLifeLost(res.data));
    // });

    axios.get(seriousInjuriesUrl).then((res) => {
      setSeriousInjuries(
        calculateTotalInjuriesOfCurrentAndPrevYear(res.data, "2019", "2020")
      );
    });

    // axios.get(totalCrashesUrl).then((res) => {
    //   setTotalCrashes(calculateTotalCrashes(res.data));
    // });

    // axios.get(fatalitiesLastYearUrl).then((res) => {
    //   setFatalitiesLastYear(calculateTotalFatalities(res.data));
    // });

    // axios.get(yearsOfLifeLostLastYearUrl).then((res) => {
    //   setYearsOfLifeLostLastYear(getYearsOfLifeLost(res.data));
    // });

    // axios.get(seriousInjuriesLastYearUrl).then((res) => {
    //   setSeriousInjuriesLastYear(calculateTotalInjuries(res.data));
    // });

    // axios.get(totalCrashesLastYearUrl).then((res) => {
    //   setTotalCrashesLastYear(calculateTotalCrashes(res.data));
    // });
  }, []);

  const summaryWidgetsConfig = [
    {
      title: `Fatalities`,
      total: fatalities,
      lastYearTotal: fatalitiesLastYear,
      icon: faHeartbeat,
      color: colors.fatalities,
    },
    {
      title: `Years of Life Lost`,
      total: yearsOfLifeLost,
      lastYearTotal: yearsOfLifeLostLastYear,
      icon: faHourglassHalf,
      color: colors.yearsOfLifeLost,
    },
    {
      title: `Serious Injuries`,
      total: seriousInjuries,
      lastYearTotal: seriousInjuriesLastYear,
      icon: faMedkit,
      color: colors.seriousInjuries,
    },
    {
      title: `Total Crashes`,
      total: totalCrashes,
      lastYearTotal: totalCrashesLastYear,
      icon: faCar,
      color: colors.totalCrashes,
    },
  ];

  return (
    <Row>
      {summaryWidgetsConfig.map((config, i) => (
        // Set Bootstrap breakpoints to divide into two rows on large mobile devices and below
        <Col className="summary-child" key={i} xs="12" md="6" xl="3">
          <SummaryWidget
            text={config.title}
            // total={config.total}
            totalsObject={config.total}
            icon={config.icon}
            backgroundColor={config.color}
            // lastYearTotal={config.lastYearTotal}
          />
        </Col>
      ))}
    </Row>
  );
};

export default SummaryView;
