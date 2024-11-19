import { Crash } from "@/types/types";
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
        {crash.address_primary}
      </span>
      <CrashInjuryIndicators injuries={crash.crash_injury_metrics_view} />
    </div>
  );
}
