import React, { useMemo, useState } from "react";
import {
  Badge,
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

const formatRecordType = recordType =>
  recordType === "people" ? "person" : recordType;

const formatEventType = eventType =>
  eventType === "INSERT" ? "create" : "update";

const formatChangeSummary = selectedChange => {
  return (
    <>
      {`${formatRecordType(selectedChange.record_type)}`} ID{" "}
      <span className="font-monospace">{selectedChange.record_id}</span> edited
      by {selectedChange.created_by}
      {" - "}
      {formatDateTimeString(selectedChange.created_at)}
    </>
  );
};

const isNewRecordEvent = change => change.operation_type === "INSERT";

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
            <th>Record type</th>
            <th>Event</th>
            <th>Affected fields</th>
            <th>Edited by</th>
            <th>Date</th>
          </thead>
          <tbody className="text-monospace">
            {changes.map(change => (
              <tr
                onClick={() => setSelectedChange(change)}
                style={{ cursor: "pointer" }}
              >
                <td>{formatRecordType(change.record_type)}</td>
                <td>{formatEventType(change.operation_type)}</td>
                <td>
                  {isNewRecordEvent(change)
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
              {formatChangeSummary(selectedChange)}
            </ModalHeader>
            <ModalBody>
              <Table responsive striped hover>
                <thead>
                  <th>Field</th>
                  {selectedChange.operation_type !== "INSERT" && (
                    <th>Previous value</th>
                  )}
                  <th>New value</th>
                </thead>
                <tbody className="text-monospace">
                  {selectedChange.diffs.map(diff => (
                    <tr>
                      <td className="text-monospace">{diff.field}</td>
                      {selectedChange.operation_type !== "INSERT" && (
                        <td className="text-monospace">{String(diff.old)}</td>
                      )}
                      <td className="text-monospace">{String(diff.new)}</td>
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
