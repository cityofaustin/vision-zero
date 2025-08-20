import { Crash } from "@/types/crashes";
import CrashInjuryIndicators from "@/components/CrashInjuryIndicators";
import { formatAddresses } from "@/utils/formatters";

interface CrashHeaderProps {
  crash: Crash;
}

/**
 * Crash details page header
 */
export default function CrashHeader({ crash }: CrashHeaderProps) {
  return (
    <div className="d-flex justify-content-between mb-3">
      <span className="fs-3 fw-bold text-uppercase">
        {formatAddresses(crash)}
      </span>
      {crash.crash_injury_metrics_view && (
        <CrashInjuryIndicators injuries={crash.crash_injury_metrics_view} />
      )}
    </div>
  );
}
