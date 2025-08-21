import { CrashInjuryMetric } from "@/types/crashInjuryMetrics";
import AlignedLabel from "@/components/AlignedLabel";

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
        <span className={`me-1 ${value ? "" : "text-secondary"}`}>{label}</span>
        {value !== 0 && (
          <span
            className={`injury-indicator-badge d-flex justify-content-center align-items-middle bg-${
              value ? "dark" : "secondary"
            }`}
          >
            {value}
          </span>
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
export default function CrashInjuryIndicators({
  injuries,
}: {
  injuries: CrashInjuryMetric;
}) {
  return (
    <div className="crash-injury-indicator fs-6 d-flex align-items-center align-self-center py-2 rounded-3 px-3 border">
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
}
