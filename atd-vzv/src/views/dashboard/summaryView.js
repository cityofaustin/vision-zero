import React, { useState, useEffect } from "react";
import SummaryWidgetTest from "../Widgets/SummaryWidgetTest";
import { colors } from "../../constants/colors";
import moment from "moment";
import axios from "axios";
import {
  faCar,
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
  const totalCrashesUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where= crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const yearsOfLifeLostUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;

  const [fatalities, setFatalities] = useState("-");
  const [seriousInjuries, setSeriousInjuries] = useState("-");
  const [totalCrashes, setTotalCrashes] = useState("-");
  const [yearsOfLifeLost, setYearsOfLifeLost] = useState("-");

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

  const calculateTotalCrashes = data => {
    let total = 0;
    data.data.forEach(record => (total += 1));
    return total;
  };

  const getYearsOfLifeLost = fatalityData => {
    // Assume 75 year life expectancy,
    // Find the difference between person.prsn_age & 75
    // Sum over the list of ppl with .reduce
    return fatalityData.reduce((accumulator, fatalityRecord) => {
      let years = 0;
      if (fatalityRecord.prsn_age !== undefined) {
        let yearsLifeLost = 75 - Number(fatalityRecord.prsn_age);
        // What if the person is older than 75?
        // For now, so we don't have negative numbers,
        // Assume years of life lost is 0
        years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
      }
      return accumulator + years;
    }, 0); // start with a count at 0 years
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(fatalitiesYearToDateUrl).then(res => {
      setFatalities(calculateTotalFatalities(res));
    });

    axios.get(seriousInjuriesYearToDateUrl).then(res => {
      setSeriousInjuries(calculateTotalInjuries(res));
    });

    axios.get(totalCrashesUrl).then(res => {
      setTotalCrashes(calculateTotalCrashes(res));
    });

    axios.get(yearsOfLifeLostUrl).then(res => {
      setYearsOfLifeLost(getYearsOfLifeLost(res.data));
    });
  }, [
    fatalitiesYearToDateUrl,
    seriousInjuriesYearToDateUrl,
    totalCrashesUrl,
    yearsOfLifeLostUrl
  ]);

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
          header={`Total Crashes in ${thisYear}`}
          mainText={totalCrashes.toString()}
          icon={faCar}
          backgroundColor={colors.info}
        />
      </Col>
      <Col sm="auto">
        <SummaryWidgetTest
          header={`Years of Life Lost in ${thisYear}`}
          mainText={yearsOfLifeLost.toString()}
          icon={faHourglass}
          backgroundColor={colors.info}
        />
      </Col>
    </Row>
  );
};

export default SummaryView;
