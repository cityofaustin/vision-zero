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
import { colors } from "../../../constants/colors";

const InfoCard = ({ content }) => {
  const ref = useRef(null);

  return (
    <Card className="m-1">
      <Table
        borderless
        size="sm"
        className="mt-0 mb-0"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <colgroup>
          <col style={{ width: "40%" }} />
          <col style={{ width: "60%" }} />
        </colgroup>
        <tbody>
          {content.map((item) => (
            <tr
              key={item.title}
              style={{ verticalAlign: "initial", fontSize: "14px" }}
            >
              <th scope="row">{item.title}</th>
              <td
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <div style={{ overflowWrap: "anywhere" }}>{item.content} </div>
                {item.title === "Crash ID" ? (
                  <>
                    <Button
                      id="copyCrashIDButton"
                      innerRef={ref}
                      aria-label="Copy crash ID"
                      style={{
                        flexShrink: 0,
                        boxShadow: "none",
                        width: "30px",
                        height: "30px",
                        padding: "6px 0px",
                        borderRadius: "15px",
                        textAlign: "center",
                        fontSize: "12px",
                        lineHeight: 1.42857,
                        backgroundColor: colors.info,
                        border: 0,
                      }}
                      outline={false}
                      onClick={() => {
                        navigator.clipboard.writeText(item.content);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faClipboard}
                        color={colors.white}
                      />
                    </Button>
                    <UncontrolledPopover
                      trigger="click"
                      placement="top"
                      target={ref}
                    >
                      <PopoverBody>Copied</PopoverBody>
                    </UncontrolledPopover>
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default InfoCard;
