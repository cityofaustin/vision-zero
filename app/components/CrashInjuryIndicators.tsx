import { CrashInjuryMetric } from "@/types/crashInjuryMetrics";
import Badge from "react-bootstrap/Badge";
import {
  FaBriefcaseMedical,
  FaCross,
  FaKitMedical,
  FaNotesMedical,
  FaSuitcaseMedical,
} from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";

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
    <span className={`${className || ""} text-nowrap me-3`}>
      <AlignedLabel>
        <span className={`me-1 ${value ? "" : "text-secondary"}`}>
          {label}
        </span>
        {value !== 0 && (
          <Badge bg={`${value ? "dark" : "secondary"}`} pill>
            {value}
          </Badge>
        )}
        {value === 0 && <span className="text-secondary">-</span>}
      </AlignedLabel>
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
      {false && <FaNotesMedical className="fs- me-2" />}
      <span className="fw-bold me-3">Injuries</span>
      <InjuryBadge
        value={injuries.vz_fatality_count}
        label="Fatal"
        className="me-3"
      />
      <InjuryBadge
        value={injuries.sus_serious_injry_count}
        label="Serious"
        className="me-3"
      />
      <InjuryBadge
        value={injuries.nonincap_injry_count}
        label="Minor"
        className="me-3"
      />
      <InjuryBadge
        value={injuries.poss_injry_count}
        label="Possible"
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
