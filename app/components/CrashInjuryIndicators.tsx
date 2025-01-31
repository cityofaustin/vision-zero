import { CrashInjuryMetric } from "@/types/crashInjuryMetrics";
import Badge from "react-bootstrap/Badge";

const InjuryBadge = ({
  label,
  value,
  className,
}: {
  label: string;
  value: number | null;
  className?: string;
}) => {
  return (
    <span className={`${className || ""} text-nowrap`}>
      <span className="me-1">{label}</span>
      {/* todo: decided if/how we want to assign colors to these badges */}
      <Badge bg={`${value ? "primary" : "dark"}`} pill>
        {value || 0}
      </Badge>
    </span>
  );
};

/**
 * Component which renders crash injuries (fatal, serious, etc) in a row
 * with labeled pills
 */
const CrashInjuryIndicators = ({
  injuries,
}: {
  injuries: CrashInjuryMetric;
}) => {
  return (
    <div className="fs-6 d-flex align-items-center bg-light rounded-3 px-3">
      <InjuryBadge
        value={injuries.vz_fatality_count}
        label="Fatalities"
        className="me-3"
      />
      <InjuryBadge
        value={injuries.sus_serious_injry_count}
        label="Serious injuries"
        className="me-3"
      />
      <InjuryBadge
        value={injuries.nonincap_injry_count}
        label="Minor injuries"
        className="me-3"
      />
      <InjuryBadge
        value={injuries.poss_injry_count}
        label="Possible injuries"
        className="me-3"
      />
      <InjuryBadge
        value={injuries.unkn_injry_count}
        label="Unknown"
        className="me-3"
      />
    </div>
  );
};

export default CrashInjuryIndicators;
