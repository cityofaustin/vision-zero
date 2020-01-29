import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryWidget from "../../Components/Widgets/SummaryWidget";
import { Row, Col } from "reactstrap";

import { thisYear, thisMonth, lastYear } from "../../constants/time";
import {
  thisYearFatalitiesUrl,
  thisYearYearsOfLifeLostUrl,
  thisYearSeriousInjuriesUrl,
  thisYearTotalCrashesUrl,
  previousYearFatalitiesUrl,
  previousYearYearsOfLifeLostUrl,
  previousYearSeriousInjuriesUrl,
  previousYearTotalCrashesUrl
} from "./queries/socrataQueries";
import {
  calculateTotalFatalities,
  getYearsOfLifeLost,
  calculateTotalInjuries,
  calculateTotalCrashes
} from "./helpers/helpers";
import { colors } from "../../constants/colors";
import {
  faCar,
  faHourglass,
  faHeartbeat,
  faMedkit
} from "@fortawesome/free-solid-svg-icons";

const SummaryView = () => {
  const [fatalities, setFatalities] = useState(null);
  const [yearsOfLifeLost, setYearsOfLifeLost] = useState(null);
  const [seriousInjuries, setSeriousInjuries] = useState(null);
  const [totalCrashes, setTotalCrashes] = useState(null);

  useEffect(() => {
    let fatalitiesUrl, yearsOfLifeLostUrl, seriousInjuriesUrl, totalCrashesUrl;

    if (thisMonth > "01") {
      fatalitiesUrl = thisYearFatalitiesUrl;
      yearsOfLifeLostUrl = thisYearYearsOfLifeLostUrl;
      seriousInjuriesUrl = thisYearSeriousInjuriesUrl;
      totalCrashesUrl = thisYearTotalCrashesUrl;
    } else {
      fatalitiesUrl = previousYearFatalitiesUrl;
      yearsOfLifeLostUrl = previousYearYearsOfLifeLostUrl;
      seriousInjuriesUrl = previousYearSeriousInjuriesUrl;
      totalCrashesUrl = previousYearTotalCrashesUrl;
    }

    axios.get(fatalitiesUrl).then(res => {
      setFatalities(calculateTotalFatalities(res.data));
    });

    axios.get(yearsOfLifeLostUrl).then(res => {
      setYearsOfLifeLost(getYearsOfLifeLost(res.data));
    });

    axios.get(seriousInjuriesUrl).then(res => {
      setSeriousInjuries(calculateTotalInjuries(res.data));
    });

    axios.get(totalCrashesUrl).then(res => {
      setTotalCrashes(calculateTotalCrashes(res.data));
    });
  }, []);

  let displayYear = thisMonth > "01" ? thisYear : lastYear;

  const summaryWidgetsConfig = [
    {
      title: `Fatalities in ${displayYear}`,
      total: fatalities,
      icon: faHeartbeat,
      color: colors.danger
    },
    {
      title: `Years of Life Lost in ${displayYear}`,
      total: yearsOfLifeLost,
      icon: faHourglass,
      color: colors.info
    },
    {
      title: `Serious Injuries in ${displayYear}`,
      total: seriousInjuries,
      icon: faMedkit,
      color: colors.warning
    },
    {
      title: `Total Crashes in ${displayYear}`,
      total: totalCrashes,
      icon: faCar,
      color: colors.success
    }
  ];

  return (
    <Row>
      {summaryWidgetsConfig.map((config, i) => (
        // Set Bootstrap breakpoints to divide into two rows on large mobile devices and below
        <Col className="summary-child" key={i} xl="3" md="6">
          <SummaryWidget
            text={config.title}
            total={config.total}
            icon={config.icon}
            backgroundColor={config.color}
          />
        </Col>
      ))}
    </Row>
  );
};

export default SummaryView;
