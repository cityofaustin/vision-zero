import { Card, Button } from "react-bootstrap";
import { LookupTableOption } from "@/types/relationships";
import { useState } from "react";
import { Charge } from "@/types/charge";
import { Unit } from "@/types/unit";
import { LuCirclePlus, LuSquarePen } from "react-icons/lu";
import AlignedLabel from "@/components/AlignedLabel";
import ContributingFactorsModal from "@/components/ContributingFactorsModal";
import { useAuth0 } from "@auth0/auth0-react";
import { hasRole } from "@/utils/auth";

interface FatalityUnitCardFooterProps {
  primaryContribFactors: (LookupTableOption | null)[];
  possibleContribFactors: (LookupTableOption | null)[];
  isTempRecord: boolean | null;
  unitCharges: Charge[] | undefined;
  hasCharges: boolean | undefined;
  hasContribFactors: boolean;
  unit: Unit;
  onSaveCallback: () => Promise<void>;
}

/**
 * The footer component for the unit cards on the fatality details page
 * Should only render if unit has charges or contrib factors
 */
export default function FatalityUnitCardFooter({
  hasCharges,
  hasContribFactors,
  isTempRecord,
  unitCharges,
  primaryContribFactors,
  possibleContribFactors,
  unit,
  onSaveCallback,
}: FatalityUnitCardFooterProps) {
  const [showModal, setShowModal] = useState(false);
  const onCloseModal = () => setShowModal(false);

  const { user } = useAuth0();

  const isReadOnlyUser = user && hasRole(["readonly"], user);

  return (
    <Card.Footer
      // If theres no card body remove extra padding
      className={"fatality-units-card-header-footer"}
    >
      <ContributingFactorsModal
        unit={unit}
        show={showModal}
        onClose={onCloseModal}
        onSaveCallback={onSaveCallback}
      />
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
          <span className="fw-bold">Contributing factors</span>
          {isTempRecord && !isReadOnlyUser && (
            <span className="ms-1">
              <Button
                size="sm"
                variant="outline-primary border-white"
                onClick={() => setShowModal(true)}
              >
                <AlignedLabel>
                  <LuSquarePen />
                </AlignedLabel>
              </Button>
            </span>
          )}
          {primaryContribFactors.map((factor, index) => (
            <div className="ms-2" key={`primary-${index}`}>
              <span className="fw-bold">Primary: </span>
              <span>{factor?.label}</span>
            </div>
          ))}
          {possibleContribFactors.map((factor, index) => (
            <div className="ms-2" key={`possible-${index}`}>
              <span className="fw-bold">Possible: </span>
              <span>{factor?.label}</span>
            </div>
          ))}
        </div>
      )}
      {!hasContribFactors && isTempRecord && (
        <div>
          <div className="fw-bold">Contributing factors</div>
          <div className="d-flex justify-content-start align-items-center">
            <span className="text-secondary">None</span>
            {!isReadOnlyUser && (
              <span className="ms-1">
                <Button
                  size="sm"
                  variant="outline-primary border-white"
                  onClick={() => setShowModal(true)}
                >
                  <AlignedLabel>
                    <LuCirclePlus />
                  </AlignedLabel>
                </Button>
              </span>
            )}
          </div>
        </div>
      )}
    </Card.Footer>
  );
}
