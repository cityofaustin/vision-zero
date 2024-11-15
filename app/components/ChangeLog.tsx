import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import { formatDateTime } from "@/utils/formatters";
import ChangeLogDetails from "./ChangeLogDetails";
import {
  ChangeLogEntry,
  ChangeLogDiff,
  ChangeLogEntryEnriched,
} from "@/types/types";

const KEYS_TO_IGNORE = ["updated_at", "updated_by", "position"];

/**
 * Return an array of values that are different between the `old` object and `new` object
 * Each object in the array takes the format
 * { field: <property name>, old: <old value>, new: <new value> }
 */
const getDiffArray = <T extends Record<string, unknown>>(
  new_: T,
  old: T | null
): ChangeLogDiff[] => {

  const diffArray = Object.keys(new_).reduce<ChangeLogDiff[]>((diffs, key) => {
    if (new_[key] !== old?.[key] && !KEYS_TO_IGNORE.includes(key)) {
      diffs.push({
        field: key,
        old: old?.[key] || null,
        new: new_[key],
      });
    }
    return diffs;
  }, []);

  // Sort array of entries by field name
  diffArray.sort((a, b) =>
    a.field < b.field ? -1 : a.field > b.field ? 1 : 0
  );

  return diffArray;
};
/**
 * Prettify the user name if it is `cris`
 */
const formatUserName = (userName: string): string =>
  userName === "cris" ? "TxDOT CRIS" : userName;

/**
 * Hook that adds `diffs` and `affected_fields` to the each ChangeLogEntry
 */
const useChangeLogData = (logs: ChangeLogEntry[]): ChangeLogEntryEnriched[] =>
  useMemo(() => {
    if (!logs) {
      return [];
    }
    return logs.map((change) => {
      const newChange: ChangeLogEntryEnriched = {
        ...change,
        diffs: [],
        affected_fields: [],
      };
      newChange.diffs = getDiffArray(
        change.record_json.new,
        change.record_json.old,
      );
      newChange.affected_fields = newChange.diffs.map((diff) => diff.field);
      change.created_by = formatUserName(change.created_by);
      return newChange;
    });
  }, [logs]);

const isNewRecordEvent = (change: ChangeLogEntryEnriched) =>
  change.operation_type === "create";

/**
 * Primary UI component which renders the change log with clickable rows
 */
export default function ChangeLog({ logs }: { logs: ChangeLogEntry[] }) {
  const [selectedChange, setSelectedChange] =
    useState<ChangeLogEntryEnriched | null>(null);

  const changes = useChangeLogData(logs);

  return (
    <Card>
      <Card.Header>Record history</Card.Header>
      <Card.Body>
        <Table striped hover>
          <thead>
            <tr>
              <th>Record type</th>
              <th>Event</th>
              <th>Affected fields</th>
              <th>Edited by</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody className="font-monospace">
            {changes.length === 0 && (
              // this should only happen in local dev where change log is not downloaded from replica
              <tr>
                <td colSpan={5} className="text-center">
                  No changes found
                </td>
              </tr>
            )}
            {changes.map((change) => (
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
                <td>{formatDateTime(change.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {/* Modal with change details table */}
        {selectedChange && (
          <ChangeLogDetails
            selectedChange={selectedChange}
            setSelectedChange={setSelectedChange}
          />
        )}
      </Card.Body>
    </Card>
  );
}
