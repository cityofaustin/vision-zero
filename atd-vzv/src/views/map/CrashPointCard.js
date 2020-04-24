import * as React from "react";
import { PureComponent } from "react";
import { Card, CardBody, CardText } from "reactstrap";
import moment from "moment";

export default class CrashPointCard extends PureComponent {
  render() {
    const { info } = this.props;

    return (
      <Card>
        <CardBody>
          <CardText>
            Date/Time: {moment(info.crash_date).format("MM/DD/YYYY HH:MM A")}
          </CardText>
          <CardText>Fatalities: {info.death_cnt}</CardText>
          <CardText>Serious Injuries: {info.sus_serious_injry_cnt}</CardText>
          <CardText>
            Modes Involved: {info.units_involved.split(" &").join(", ")}
          </CardText>
          <CardText>Crash ID: {info.crash_id}</CardText>
        </CardBody>
      </Card>
    );
  }
}
