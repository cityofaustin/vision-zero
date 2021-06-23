import * as React from "react";
import { PureComponent } from "react";
import { Card, Table, Button, UncontrolledPopover, PopoverBody } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboard } from '@fortawesome/free-solid-svg-icons'
import styled from "styled-components";

const StyledTableRow = styled.tr`
  .align {
    vertical-align: initial;
  }
`;

export default class InfoCard extends PureComponent {
  render() {
    const { content } = this.props;

    return (
      <Card className="p-2 m-1">
        <Table borderless size="sm" className="mt-0 mb-0">
          <tbody>
            {content.map((item) =>  (
              <StyledTableRow key={item.title}>
                <th className="align" scope="row">{item.title}</th>
                <td className="align" >{item.content}</td>
                {item.title === 'Crash ID' ? 
                  <td className="align" >
                    <Button id="PopoverFocus" color="link" onClick={() => {navigator.clipboard.writeText(item.content)}}>
                      <FontAwesomeIcon icon={faClipboard} />
                    </Button>
                  </td> 
                  : null }
              </StyledTableRow>
            ))}
          </tbody>
        </Table>
        <UncontrolledPopover trigger="focus" placement="top" target="PopoverFocus">
        <PopoverBody>Copied</PopoverBody>
      </UncontrolledPopover>
      </Card>
    );
  }
}
