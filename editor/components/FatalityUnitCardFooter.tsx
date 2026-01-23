import { Card } from "react-bootstrap";
import { LookupTableOption } from "@/types/relationships";
import { Charge } from "@/types/charge";

interface FatalityUnitCardFooterProps {
  primaryContribFactors: (LookupTableOption | null)[];
  possibleContribFactors: (LookupTableOption | null)[];
  unitCharges: Charge[] | undefined;
  hasCharges: boolean | undefined;
  hasVictim: boolean | undefined;
  hasContribFactors: boolean;
}

/**
 * The footer component for the unit cards on the fatality details page
 * Should only render if unit has charges or contrib factors
 */
export default function FatalityUnitCardFooter({
  hasCharges,
  hasVictim,
  hasContribFactors,
  unitCharges,
  primaryContribFactors,
  possibleContribFactors,
}: FatalityUnitCardFooterProps) {
  return (
    <Card.Footer
      // If theres no card body remove extra padding
      className={
        "fatality-units-card-header-footer " + (!hasVictim ? "pt-0" : "")
      }
    >
      {hasCharges && (
        <div className="pb-1">
          <div className="fw-bold">Charges</div>
          {unitCharges?.map((charge) => (
            <div className="ms-2" key={charge.id}>
              {charge.charge}
            </div>
          ))}
        </div>
      )}
      {hasContribFactors && (
        <div>
          <div className="fw-bold">Contributing factors</div>
          {primaryContribFactors.map((factor) => (
            <div className="ms-2" key={factor?.id}>
              <span className="fw-bold">Primary: </span>
              <span>{factor?.label}</span>
            </div>
          ))}
          {possibleContribFactors.map((factor) => (
            <div className="ms-2" key={factor?.id}>
              <span className="fw-bold">Possible: </span>
              <span>{factor?.label}</span>
            </div>
          ))}
        </div>
      )}
    </Card.Footer>
  );
}
