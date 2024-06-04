import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { formatDateTimeString } from "../../helpers/format";

const KEYS_TO_IGNORE = ["updated_at", "updated_by", "position"];

/**
 * Return an array of values that are different between the `old` object and `new` object
 * Each object in the array takes the format
 * { field: <property name>, old: <old value>, new: <new value> }
 */
const getDiffArray = (old, new_) => {
  const diffArray = Object.keys(new_).reduce((diffs, key) => {
    if (new_?.[key] !== old?.[key] && KEYS_TO_IGNORE.indexOf(key) < 0) {
      diffs.push({ field: key, old: old?.[key], new: new_?.[key] });
    }
    return diffs;
  }, []);
  // sort array of entries by field name
  diffArray.sort((a, b) => {
    if (a.field < b.field) {
      return -1;
    }
    if (a.field > b.field) {
      return 1;
    }
    return 0;
  });
  return diffArray;
};

/**
 * Hook that identifies that returns an array differences between new and old records
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

/**
 * Header component of the change details table
 */
const ChangeSummary = ({ selectedChange }) => {
  return (
    <>
      {`${selectedChange.record_type}`} ID{" "}
      <span className="font-monospace">{selectedChange.record_id}</span> edited
      by {selectedChange.created_by}
      {" - "}
      {formatDateTimeString(selectedChange.created_at)}
    </>
  );
};

const isNewRecordEvent = change => change.operation_type === "create";

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
                key={change.id}
                onClick={() => setSelectedChange(change)}
                style={{ cursor: "pointer" }}
              >
                <td>{change.record_type}</td>
                <td>{change.operation_type}</td>
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
        {/* Modal with change details table */}
        {selectedChange && (
          <Modal
            isOpen={!!selectedChange}
            toggle={() => setSelectedChange(null)}
            className="mw-100 mx-5"
            fade={false}
          >
            <ModalHeader toggle={() => setSelectedChange(null)}>
              <ChangeSummary selectedChange={selectedChange} />
            </ModalHeader>
            <ModalBody>
              <Table responsive striped hover>
                <thead>
                  <th>Field</th>
                  {!isNewRecordEvent(selectedChange) && <th>Previous value</th>}
                  <th>New value</th>
                </thead>
                <tbody className="text-monospace">
                  {selectedChange.diffs.map(diff => (
                    <tr>
                      <td className="text-monospace">{diff.field}</td>
                      {!isNewRecordEvent(selectedChange) && (
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
