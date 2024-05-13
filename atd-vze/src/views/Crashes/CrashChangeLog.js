import React, { useMemo } from "react";

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
    if (new_[key] !== old[key] && KEYS_TO_IGNORE.indexOf(key) < 0) {
      diffs.push({ field: key, old: old[key], new: new_[key] });
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
      if (change.operation_type === "INSERT") {
        return change;
      }

      change.diffs = getDiffArray(
        change.record_json.old,
        change.record_json.new
      );
      change.affected_fields = change.diffs.map(diff => diff.field);
      return change;
    });
  }, [data]);

export default function CrashChangeLog({ data }) {
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
            <th>Affected fields</th>
            <th>Edited by</th>
            <th>Date</th>
          </thead>
          <tbody>
            {changes.map(change => (
              <tr>
                <td>{change.record_type}</td>
                <td>
                  {change.operation_type === "INSERT"
                    ? "(record created)"
                    : change.affected_fields.join(", ")}
                </td>
                <td>{change.created_by}</td>
                <td>{formatDateTimeString(change.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
