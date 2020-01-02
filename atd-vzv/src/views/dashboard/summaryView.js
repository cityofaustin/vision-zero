import React, { useState, useEffect } from "react";
import SummaryWidgetTest from "../Widgets/SummaryWidgetTest";
import { colors } from "../../constants/colors";
import moment from "moment";
import axios from "axios";
import {
  faHourglass,
  faHeartbeat,
  faMedkit
} from "@fortawesome/free-solid-svg-icons";
import { Row, Col } from "reactstrap";

const SummaryView = () => {
  const thisYear = moment().format("YYYY");
  const today = moment().format("YYYY-MM-DD");
  const fatalitiesYearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const seriousInjuriesYearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=sus_serious_injry_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;

  const [fatalities, setFatalities] = useState("-");
  const [seriousInjuries, setSeriousInjuries] = useState("-");

  const calculateTotalFatalities = data => {
    let total = 0;
    data.data.forEach(record => (total += parseInt(record.death_cnt)));
    return total;
  };

  const calculateTotalInjuries = data => {
    let total = 0;
    data.data.forEach(
      record => (total += parseInt(record.sus_serious_injry_cnt))
    );
    return total;
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(fatalitiesYearToDateUrl).then(res => {
      setFatalities(calculateTotalFatalities(res));
    });

    axios.get(seriousInjuriesYearToDateUrl).then(res => {
      setSeriousInjuries(calculateTotalInjuries(res));
    });
  }, [fatalitiesYearToDateUrl, seriousInjuriesYearToDateUrl]);

  return (
    <Row>
      <Col sm="auto">
        <SummaryWidgetTest
          header={`Fatalities in ${thisYear}`}
          mainText={fatalities.toString()}
          icon={faHeartbeat}
          backgroundColor={colors.danger}
        />
      </Col>
      <Col sm="auto">
        <SummaryWidgetTest
          header={`Serious Injuries in ${thisYear}`}
          mainText={seriousInjuries.toString()}
          icon={faMedkit}
          backgroundColor={colors.warning}
        />
      </Col>
      <Col sm="auto">
        <SummaryWidgetTest
          header={`Test 3`}
          mainText={"Years of Life Lost"}
          icon={faHourglass}
          backgroundColor={colors.info}
        />
      </Col>
      <Col sm="auto">
        <SummaryWidgetTest
          header={`Test 4`}
          mainText={"Years of Life Lost"}
          icon={faHourglass}
          backgroundColor={colors.info}
        />
      </Col>
    </Row>
  );
};

export default SummaryView;
