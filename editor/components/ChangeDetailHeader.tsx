import { ChangeLogEntryEnriched } from "@/types/changeLog";
import { formatDateTime } from "@/utils/formatters";

/**
 * Header component of the change details table
 */
const ChangeDetailHeader = ({
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

export default ChangeDetailHeader;
