import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { ChangeLogEntryEnriched } from "@/types/types";
import { formatDateTime } from "@/utils/formatters";

const isNewRecordEvent = (change: ChangeLogEntryEnriched) =>
  change.operation_type === "create";

/**
 * Header component of the change details table
 */
const ChangeSummary = ({
  selectedChange,
}: {
  selectedChange: ChangeLogEntryEnriched;
}) => {
  return (
    <div>
      <span className="font-monospace fw-bold">{`${selectedChange.record_type}`}</span>{" "}
      <span>{selectedChange.operation_type}</span>
      {" | "} <span>{selectedChange.created_by}</span>
      {" | "}
      {formatDateTime(selectedChange.created_at)}
    </div>
  );
};

/**
 * Modal which renders change log details when a change log entry is clicked
 */
const CrashChangeLogDetails = ({
  selectedChange,
  setSelectedChange,
}: {
  selectedChange: ChangeLogEntryEnriched;
  setSelectedChange: Dispatch<SetStateAction<ChangeLogEntryEnriched | null>>;
}) => {
  return (
    <Modal
      show={!!selectedChange}
      onHide={() => setSelectedChange(null)}
      size="xl"
    >
      <Modal.Header>
        <ChangeSummary selectedChange={selectedChange} />
      </Modal.Header>
      <Modal.Body>
        <Table responsive striped hover>
          <thead>
            <th>Field</th>
            {!isNewRecordEvent(selectedChange) && <th>Previous value</th>}
            <th>New value</th>
          </thead>
          <tbody className="font-monospace">
            {selectedChange.diffs.map((diff) => (
              <tr key={diff.field}>
                <td>{diff.field}</td>
                {!isNewRecordEvent(selectedChange) && (
                  <td>{String(diff.old)}</td>
                )}
                <td>{String(diff.new)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button color="secondary" onClick={() => setSelectedChange(null)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CrashChangeLogDetails;
