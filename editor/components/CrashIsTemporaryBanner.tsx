import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import DeleteTemporaryCrashModal from "./DeleteTemporaryCrashModal";
import PermissionsRequired from "@/components/PermissionsRequired";
import { Crash } from "@/types/crashes";

const allowedDeleteCrashRecordEditRoles = ["vz-admin", "editor"];

interface CrashIsTemporaryBannerProps {
  crash: Crash;
}

/**
 * Banner that alerts the user when viewing a "temporary" crash record, aka
 * a crash record that was manually created through the UI.
 * Delete opens a modal to optionally transfer data to another crash.
 */
export default function CrashIsTemporaryBanner({
  crash,
}: CrashIsTemporaryBannerProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <Alert
        variant="warning"
        className="d-flex justify-content-between align-items-center"
      >
        <span className="d-flex align-items-center">
          <FaTriangleExclamation className="me-2 d-none d-lg-inline" />
          <span className="me-3">
            This crash record was created by the Vision Zero team and serves as a
            placeholder until the CR3 report is received from TxDOT. It may be
            deleted at any time.
          </span>
        </span>
        <PermissionsRequired allowedRoles={allowedDeleteCrashRecordEditRoles}>
          <span>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <AlignedLabel>
                <FaTrash className="me-2" />
                <span>Delete</span>
              </AlignedLabel>
            </Button>
          </span>
        </PermissionsRequired>
      </Alert>
      <DeleteTemporaryCrashModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        crash={crash}
      />
    </>
  );
}
