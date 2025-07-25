import { useState } from "react";
import { Button } from "react-bootstrap";
import { Crash } from "@/types/crashes";
import CrashInjuryIndicators from "@/components/CrashInjuryIndicators";
import { formatAddresses } from "@/utils/formatters";
import { FaPenToSquare } from "react-icons/fa6";
import EditCrashAddressModal from "@/components/EditCrashAddressModal";

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

  return (
    <div className="d-flex justify-content-between mb-3">
      <Button
        onClick={() => setShowEditAddressModal(true)}
        className="d-flex align-items-baseline edit-address-button"
      >
        <span className="fs-3 fw-bold text-uppercase me-2">
          {formatAddresses(crash)}
        </span>
        <FaPenToSquare className="text-muted" />
      </Button>
      {crash.crash_injury_metrics_view && (
        <CrashInjuryIndicators injuries={crash.crash_injury_metrics_view} />
      )}
      <EditCrashAddressModal
        crashId={crash.id}
        show={showEditAddressModal}
        setShowEditAddressModal={setShowEditAddressModal}
        onSaveCallback={onSaveCallback}
        crash={crash}
      ></EditCrashAddressModal>
    </div>
  );
}
