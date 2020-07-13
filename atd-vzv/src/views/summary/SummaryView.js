import React from "react";

import SummaryWidget from "../../Components/Widgets/SummaryWidget";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";
import { Row, Col } from "reactstrap";

import { colors } from "../../constants/colors";
import {
  faCar,
  faHourglassHalf,
  faHeartbeat,
  faMedkit,
} from "@fortawesome/free-solid-svg-icons";

const SummaryView = (props) => {
  let data = {
    "fatalities": null,
    "years_of_life_lost": null,
    "sus_serious_injry_cnt": null,
    "total_crashes": null,
  };

  if(props.data) {
    console.log("Summary View Data:", props.data);
    data.fatalities = {};
    data.fatalities[props.data[0].year] = props.data[0].death_cnt;
    data.fatalities[props.data[1].year] = props.data[1].death_cnt;

    data.years_of_life_lost = {};
    data.years_of_life_lost[props.data[0].year] = props.data[0].years_of_life_lost;
    data.years_of_life_lost[props.data[1].year] = props.data[1].years_of_life_lost;

    data.sus_serious_injry_cnt = {};
    data.sus_serious_injry_cnt[props.data[0].year] = props.data[0].sus_serious_injry_cnt;
    data.sus_serious_injry_cnt[props.data[1].year] = props.data[1].sus_serious_injry_cnt;

    data.total_crashes = {};
    data.total_crashes[props.data[0].year] = props.data[0].total_crashes;
    data.total_crashes[props.data[1].year] = props.data[1].total_crashes;
  }

  const summaryWidgetsConfig = [
    {
      title: `Fatalities`,
      totalsObject: data.fatalities,
      icon: faHeartbeat,
      color: colors.fatalities,
    },
    {
      title: `Years of Life Lost`,
      infoPopover: (
        <InfoPopover config={popoverConfig.summary.yearsOfLifeLost} />
      ),
      totalsObject: data.years_of_life_lost,
      icon: faHourglassHalf,
      color: colors.yearsOfLifeLost,
    },
    {
      title: `Serious Injuries`,
      totalsObject: data.sus_serious_injry_cnt,
      icon: faMedkit,
      color: colors.seriousInjuries,
    },
    {
      title: `Total Crashes`,
      totalsObject: data.total_crashes,
      icon: faCar,
      color: colors.totalCrashes,
    },
  ];

  return (
    <Row>
      {summaryWidgetsConfig.map((config, i) => (
        // Set Bootstrap breakpoints to divide into two rows on large mobile devices and below
        <Col className="summary-child" key={i} xs="12" sm="6" xl="3">
          <SummaryWidget
            text={config.title}
            totalsObject={config.totalsObject}
            icon={config.icon}
            backgroundColor={config.color}
            infoPopover={config.infoPopover}
          />
        </Col>
      ))}
    </Row>
  );
};

export default SummaryView;
