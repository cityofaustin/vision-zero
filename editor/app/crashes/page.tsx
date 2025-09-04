"use client";
import { useState, useCallback } from "react";
import Button from "react-bootstrap/Button";
import AlignedLabel from "@/components/AlignedLabel";
import CreateCrashRecordModal from "@/components/CreateCrashRecordModal";
import { FaCirclePlus } from "react-icons/fa6";
import { crashesListViewColumns } from "@/configs/crashesListViewColumns";
import { crashesListViewQueryConfig } from "@/configs/crashesListViewTable";
import PermissionsRequired from "@/components/PermissionsRequired";
import TableWrapper from "@/components/TableWrapper";
import { useDocumentTitle } from "@/utils/documentTitle";

const localStorageKey = "crashesListViewQueryConfig";

const allowedCreateCrashRecordRoles = ["vz-admin", "editor"];

export default function Crashes() {
  useDocumentTitle("Crashes");

  const [refetch, setRefetch] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const onCloseModal = () => setShowNewUserModal(false);

  const onSaveCallback = useCallback(() => {
    setRefetch((prev) => !prev);
    setShowNewUserModal(false);
  }, [setRefetch]);

  return (
    <>
      <div className="h-100 d-flex flex-column">
        <div className="d-flex justify-content-between">
          <span className="fs-3 fw-bold">Crashes</span>
          <PermissionsRequired allowedRoles={allowedCreateCrashRecordRoles}>
            <Button
              variant="outline-primary"
              onClick={() => setShowNewUserModal(true)}
            >
              <AlignedLabel>
                <FaCirclePlus className="me-2" />
                <span>Create</span>
              </AlignedLabel>
            </Button>
          </PermissionsRequired>
        </div>
        <TableWrapper
          columns={crashesListViewColumns}
          initialQueryConfig={crashesListViewQueryConfig}
          localStorageKey={localStorageKey}
          refetch={refetch}
        />
      </div>
      <CreateCrashRecordModal
        onClose={onCloseModal}
        show={showNewUserModal}
        onSubmitCallback={onSaveCallback}
      />
    </>
  );
}
