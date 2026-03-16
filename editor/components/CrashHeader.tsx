import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { Crash } from "@/types/crashes";
import CrashInjuryIndicators from "@/components/CrashInjuryIndicators";
import { LuSquarePen } from "react-icons/lu";
import EditCrashAddressModal from "@/components/EditCrashAddressModal";
import { hasRole } from "@/utils/auth";
import CopyValueButton from "@/components/CopyValueButton";

interface CrashHeaderProps {
  crash: Crash;
  refetch: () => Promise<unknown>;
}

/**
 * Crash details page header
 */
export default function CrashHeader({ crash, refetch }: CrashHeaderProps) {
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);

  const onSaveCallback = () => {
    setShowEditAddressModal(false);
    refetch();
  };

  const { user } = useAuth0();

  const isReadOnlyUser = user && hasRole(["readonly"], user);

  return (
    <Row className="d-flex justify-content-between align-items-center mb-3">
      <Col className="d-flex align-items-center">
        {isReadOnlyUser ? (
          <span className="fs-3 fw-bold text-uppercase me-2">
            {crash.address_display}
          </span>
        ) : (
          <Button
            onClick={() => setShowEditAddressModal(true)}
            className="d-flex align-items-center edit-address-button"
          >
            <span className="fs-3 fw-bold text-uppercase me-2 text-nowrap">
              {crash.address_display}
            </span>
            <LuSquarePen className="text-muted" />
          </Button>
        )}
        <CopyValueButton
          tooltipLabel="Copy address"
          value={String(crash.address_display || "")}
        />
      </Col>
      {crash.crash_injury_metrics_view && (
        <Col xs="auto">
          <CrashInjuryIndicators injuries={crash.crash_injury_metrics_view} />
        </Col>
      )}
      <EditCrashAddressModal
        crashId={crash.id}
        show={showEditAddressModal}
        setShowEditAddressModal={setShowEditAddressModal}
        onSaveCallback={onSaveCallback}
        crash={crash}
      ></EditCrashAddressModal>
    </Row>
  );
}
