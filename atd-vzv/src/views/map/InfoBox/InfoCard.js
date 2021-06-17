import * as React from "react";
import { PureComponent } from "react";
import { Card, Table } from "reactstrap";

export default class InfoCard extends PureComponent {
  render() {
    const { content } = this.props;

    return (
      <Card className="p-2 m-1">
        <Table borderless size="sm" className="mt-0 mb-0">
          <tbody>
            {content.map((item) => (
              <tr key={item.title}>
                <th scope="row">{item.title}</th>
                <td>{item.content}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    );
  }
}
