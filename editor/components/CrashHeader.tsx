import { Crash } from "@/types/crashes";
import CrashInjuryIndicators from "./CrashInjuryIndicators";

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
        {`${crash.address_primary ? crash.address_primary : ""} ${
          crash.address_secondary ? "& " + crash.address_secondary : ""
        }`}
      </span>
      {crash.crash_injury_metrics_view && (
        <CrashInjuryIndicators injuries={crash.crash_injury_metrics_view} />
      )}
    </div>
  );
}
