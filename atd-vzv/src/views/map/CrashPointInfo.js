import * as React from "react";
import { PureComponent } from "react";
import moment from "moment";

export default class CrashPointInfo extends PureComponent {
  render() {
    const { info } = this.props;
    const displayName = `${info.city}, ${info.state}`;

    return (
      <div>
        <div>
          <div>
            Date: {moment(info.crash_date).format("MM/DD/YYYY HH:MM A")}
          </div>
          <div>Fatalities: {info.death_cnt}</div>
          <div>Serious Injuries: {info.sus_serious_injry_cnt}</div>
          <div>Modes: {info.units_involved}</div>
          <div>Crash ID: {info.crash_id}</div>
          {/* <a
            target="_new"
            href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${displayName}`}
          >
            Wikipedia
          </a> */}
        </div>
      </div>
    );
  }
}
