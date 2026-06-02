import { ChangeLogEntryEnriched } from "@/types/changeLog";
import { formatIsoDateTimeWithDay } from "@/utils/formatters";

/**
 * Header component of the change details table
 */
export default function ChangeDetailHeader({
  selectedChange,
}: {
  selectedChange: ChangeLogEntryEnriched;
}) {
  return (
    <div>
      <span className="font-monospace fw-bold">{`${selectedChange.record_type}`}</span>{" "}
      <span>{selectedChange.operation_type}</span>
      {" | "} <span>{selectedChange.created_by}</span>
      {" | "}
      {formatIsoDateTimeWithDay(selectedChange.created_at)}
    </div>
  );
}
