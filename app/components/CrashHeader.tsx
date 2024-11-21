import { formatDateTime } from "@/utils/formatters";
import { Crash } from "@/types/crashes";

interface CrashHeaderProps {
  crash: Crash;
}

/**
 * Crash details page header
 */
export default function CrashHeader({ crash }: CrashHeaderProps) {
  return (
    <div className="d-flex justify-content-between mb-3">
      <span className="display-6">{crash.address_primary}</span>
      <div>
        <span>Updated by </span>
        <span className="me-1">
          {crash.updated_by?.replace("@austintexas.gov", " on ")}
        </span>
        <span>{crash.updated_at && formatDateTime(crash.updated_at)}</span>
      </div>
    </div>
  );
}
