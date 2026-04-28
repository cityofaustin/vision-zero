import { Card, Button } from "react-bootstrap";
import { LookupTableOption } from "@/types/relationships";
import { useState } from "react";
import { Charge } from "@/types/charge";
import { Unit } from "@/types/unit";
import { LuCirclePlus, LuSquarePen } from "react-icons/lu";
import AlignedLabel from "@/components/AlignedLabel";
import ContributingFactorsModal from "@/components/ContributingFactorsModal";
import ChargesModal from "@/components/ChargesModal";
import { useAuth0 } from "@auth0/auth0-react";
import { hasRole } from "@/utils/auth";

interface FatalityUnitCardFooterProps {
  crashPk: number;
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
  crashPk,
  hasCharges,
  hasContribFactors,
  isTempRecord,
  unitCharges,
  primaryContribFactors,
  possibleContribFactors,
  unit,
  onSaveCallback,
}: FatalityUnitCardFooterProps) {
  const [showContribFactorsModal, setShowContribFactorsModal] = useState(false);
  const [showChargesModal, setShowChargesModal] = useState(false);

  const { user } = useAuth0();

  const isReadOnlyUser = user && hasRole(["readonly"], user);

  return (
    <Card.Footer
      // If theres no card body remove extra padding
      className={"fatality-units-card-header-footer"}
    >
      <ContributingFactorsModal
        unit={unit}
        show={showContribFactorsModal}
        setShowContribFactorsModal={setShowContribFactorsModal}
        onSaveCallback={onSaveCallback}
      />
      <ChargesModal
        crashPk={crashPk}
        unit={unit}
        unitChargeRecord={unitCharges?.[0]}
        show={showChargesModal}
        setShowChargesModal={setShowChargesModal}
        onSaveCallback={onSaveCallback}
      />
      {hasContribFactors && (
        <div className="pb-2">
          <span className="fw-bold">Contributing factors</span>
          {isTempRecord && !isReadOnlyUser && (
            <span className="ms-1">
              <Button
                size="sm"
                variant="outline-primary border-white"
                onClick={() => setShowContribFactorsModal(true)}
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
        <div className="pb-2">
          <div className="fw-bold">Contributing factors</div>
          <div className="d-flex justify-content-start align-items-center">
            <span className="text-secondary">None</span>
            {!isReadOnlyUser && (
              <span className="ms-1">
                <Button
                  size="sm"
                  variant="outline-primary border-white"
                  onClick={() => setShowContribFactorsModal(true)}
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
      {hasCharges && (
        <div>
          <span className="fw-bold">Charges</span>
          {isTempRecord && !isReadOnlyUser && (
            <span className="ms-1">
              <Button
                size="sm"
                variant="outline-primary border-white"
                onClick={() => setShowChargesModal(true)}
              >
                <AlignedLabel>
                  <LuSquarePen />
                </AlignedLabel>
              </Button>
            </span>
          )}
          {unitCharges?.map((charge) => (
            <div
              className="ms-2"
              key={charge.id}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {charge.charge}
            </div>
          ))}
        </div>
      )}
      {!hasCharges && isTempRecord && (
        <div className="pt-1">
          <div className="fw-bold">Charges</div>
          <div className="d-flex justify-content-start align-items-center">
            <span className="text-secondary">None</span>
            {!isReadOnlyUser && (
              <span className="ms-1">
                <Button
                  size="sm"
                  variant="outline-primary border-white"
                  onClick={() => setShowChargesModal(true)}
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
