import React, { useState, useEffect } from "react";
import axios from "axios";
import SummaryWidget from "../../Components/Widgets/SummaryWidget";
import { Row, Col } from "reactstrap";

import { thisYear } from "./helpers/time";
import {
  fatalitiesYTDUrl,
  seriousInjuriesYTDUrl,
  totalCrashesYTDUrl,
  yearsOfLifeLostYTDUrl
} from "./queries/socrataQueries";
import {
  calculateTotalFatalities,
  calculateTotalInjuries,
  calculateTotalCrashes,
  getYearsOfLifeLost
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
  const [seriousInjuries, setSeriousInjuries] = useState(null);
  const [totalCrashes, setTotalCrashes] = useState(null);
  const [yearsOfLifeLost, setYearsOfLifeLost] = useState(null);

  useEffect(() => {
    axios.get(fatalitiesYTDUrl).then(res => {
      setFatalities(calculateTotalFatalities(res.data));
    });

    axios.get(seriousInjuriesYTDUrl).then(res => {
      setSeriousInjuries(calculateTotalInjuries(res.data));
    });

    axios.get(totalCrashesYTDUrl).then(res => {
      setTotalCrashes(calculateTotalCrashes(res.data));
    });

    axios.get(yearsOfLifeLostYTDUrl).then(res => {
      setYearsOfLifeLost(getYearsOfLifeLost(res.data));
    });
  }, []);

  const summaryWidgetsConfig = [
    {
      title: `Fatalities in ${thisYear}`,
      total: fatalities,
      icon: faHeartbeat,
      color: colors.danger
    },
    {
      title: `Serious Injuries in ${thisYear}`,
      total: seriousInjuries,
      icon: faMedkit,
      color: colors.warning
    },
    {
      title: `Total Crashes in ${thisYear}`,
      total: totalCrashes,
      icon: faCar,
      color: colors.success
    },
    {
      title: `Years of Life Lost in ${thisYear}`,
      total: yearsOfLifeLost,
      icon: faHourglass,
      color: colors.info
    }
  ];

  return (
    <Row>
      {summaryWidgetsConfig.map((config, i) => (
        // Set Bootstrap breakpoints to divide into two rows on large mobile devices and below
        <Col key={i} xl="3" md="6" className="mb-2 mt-2">
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
