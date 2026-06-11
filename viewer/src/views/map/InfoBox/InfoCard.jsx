import React, { useRef } from "react";
import {
  Card,
  Table,
  Button,
  UncontrolledPopover,
  PopoverBody,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const StyledTableRow = styled.tr`
  .align {
    vertical-align: initial;
  }
`;

const InfoCard = ({ content }) => {
  const ref = useRef(null);

  return (
    <Card className="p-2 m-1">
      <Table borderless size="sm" className="mt-0 mb-0">
        <tbody>
          {content.map((item) => (
            <StyledTableRow key={item.title}>
              <th className="align" scope="row">
                {item.title}
              </th>
              <td className="align">{item.content}</td>
              {item.title === "Crash ID" ? (
                <td className="align" ref={ref}>
                  <Button
                    id="PopoverFocus"
                    style={{
                      boxShadow: "none",
                      width: "30px",
                      height: "30px",
                      padding: "6px 0px",
                      borderRadius: "15px",
                      textAlign: "center",
                      fontSize: "12px",
                      lineHeight: 1.42857,
                    }}
                    color="info"
                    outline={false}
                    onClick={() => {
                      navigator.clipboard.writeText(item.content);
                    }}
                  >
                    <FontAwesomeIcon icon={faClipboard} />
                  </Button>
                </td>
              ) : null}
            </StyledTableRow>
          ))}
        </tbody>
      </Table>
      <UncontrolledPopover trigger="focus" placement="top" target={ref}>
        <PopoverBody>Copied</PopoverBody>
      </UncontrolledPopover>
    </Card>
  );
};

export default InfoCard;
