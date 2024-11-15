import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import ChangeDetailHeader from "./ChangeDetailHeader";
import { ChangeLogEntryEnriched } from "@/types/types";

const isNewRecordEvent = (change: ChangeLogEntryEnriched) =>
  change.operation_type === "create";

/**
 * Modal which renders change log details when a change log entry is clicked
 */
const ChangeLogDetails = ({
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
        <ChangeDetailHeader selectedChange={selectedChange} />
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

export default ChangeLogDetails;
