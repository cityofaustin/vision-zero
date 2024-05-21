import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Table,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { formatDateTimeString } from "../../helpers/format";

const KEYS_TO_IGNORE = ["updated_at", "updated_by", "position"];

const getDiffArray = (old, new_) => {
  return Object.keys(new_).reduce((diffs, key) => {
    if (new_?.[key] !== old?.[key] && KEYS_TO_IGNORE.indexOf(key) < 0) {
      diffs.push({ field: key, old: old?.[key], new: new_?.[key] });
    }
    return diffs;
  }, []);
};

/**
 * Hook that identifies differences between new and old records
 */
const useChangeLogData = data =>
  useMemo(() => {
    if (!data) {
      return [];
    }
    return data.map(change => {
      // hold an array of key
      change.diffs = [];
      change.affected_fields = [];
      change.diffs = getDiffArray(
        change.record_json.old,
        change.record_json.new
      );
      change.affected_fields = change.diffs.map(diff => diff.field);
      return change;
    });
  }, [data]);

const toTitleCase = str =>
  str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();

const formatEventName = (recordType, eventType) =>
  `${toTitleCase(recordType)} ${eventType
    .toLowerCase()
    .replace("insert", "create")}`;

export default function CrashChangeLog({ data }) {
  const [selectedChange, setSelectedChange] = useState(null);

  const changes = useChangeLogData(data);
  if (changes.length === 0) {
    return <p>No change history found</p>;
  }
  return (
    <Card>
      <CardHeader>Record history</CardHeader>
      <CardBody>
        <Table responsive striped hover>
          <thead>
            <th>Event</th>
            <th>Affected fields</th>
            <th>Edited by</th>
            <th>Date</th>
          </thead>
          <tbody>
            {changes.map(change => (
              <tr
                onClick={() => setSelectedChange(change)}
                style={{ cursor: "pointer" }}
              >
                <td className="font-weight-bold">
                  {formatEventName(change.record_type, change.operation_type)}
                </td>
                <td>
                  {change.operation_type === "INSERT"
                    ? ""
                    : change.affected_fields.join(", ")}
                </td>
                <td>{change.created_by}</td>
                <td>{formatDateTimeString(change.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {selectedChange && (
          <Modal
            isOpen={!!selectedChange}
            toggle={() => setSelectedChange(null)}
            className="mw-100 mx-5"
            fade={false}
          >
            <ModalHeader toggle={() => setSelectedChange(null)}>
              Record history
            </ModalHeader>
            <ModalBody>
              <Row>
                <Col>
                  <p>
                    {" "}
                    {`${selectedChange.record_type} edited by ${
                      selectedChange.created_by
                    } on ${formatDateTimeString(selectedChange.created_at)}`}
                  </p>
                </Col>
              </Row>
              <Table responsive striped hover>
                <thead>
                  <th>Field</th>
                  <th>Previous value</th>
                  <th>New value</th>
                </thead>
                <tbody>
                  {selectedChange.diffs.map(diff => (
                    <tr>
                      <td>{diff.field}</td>
                      <td>{String(diff.old)}</td>
                      <td>{String(diff.new)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setSelectedChange(null)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </CardBody>
    </Card>
  );
}
