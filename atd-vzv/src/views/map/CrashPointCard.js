import * as React from "react";
import { PureComponent } from "react";
import { Card, Table } from "reactstrap";
import moment from "moment";

export default class CrashPointCard extends PureComponent {
  render() {
    const { info } = this.props;

    return (
      <Card className="p-1">
        <Table borderless size="sm" className="mt-0 mb-0">
          <tbody>
            <tr>
              <th scope="row">Date/Time</th>
              <td>{moment(info.crash_date).format("MM/DD/YYYY HH:MM A")}</td>
            </tr>
            <tr>
              <th scope="row">Fatalities</th>
              <td>{info.death_cnt}</td>
            </tr>
            <tr>
              <th scope="row">Serious Injuries</th>
              <td>{info.sus_serious_injry_cnt}</td>
            </tr>
            <tr>
              <th scope="row">Modes Involved</th>
              <td>{info.units_involved.split(" &").join(", ")}</td>
            </tr>
            <tr>
              <th scope="row">Crash ID</th>
              <td>{info.crash_id}</td>
            </tr>
          </tbody>
        </Table>
      </Card>
    );
  }
}
