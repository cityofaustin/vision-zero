"use client";
import { useState, useCallback } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import AlignedLabel from "@/components/AlignedLabel";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import CreateCrashRecordModal from "@/components/CreateCrashRecordModal";
import { FaCirclePlus } from "react-icons/fa6";
import { crashesListViewColumns } from "@/configs/crashesListViewColumns";
import { crashesListViewQueryConfig } from "@/configs/crashesListViewTable";
import PermissionsRequired from "@/components/PermissionsRequired";
import TableWrapper from "@/components/TableWrapper";
const localStorageKey = "crashesListViewQueryConfig";

const allowedCreateCrashRecordRoles = ["vz-admin", "editor"];

export default function Crashes() {
  const [refetch, setRefetch] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const onCloseModal = () => setShowNewUserModal(false);

  const onSaveCallback = useCallback(() => {
    setRefetch((prev) => !prev);
    setShowNewUserModal(false);
  }, [setRefetch]);

  return (
    <>
      <AppBreadCrumb />
      <Card>
        <Card.Header className="fs-5 fw-bold d-flex justify-content-between">
          Crashes
          <PermissionsRequired allowedRoles={allowedCreateCrashRecordRoles}>
            <Button className="me-2" onClick={() => setShowNewUserModal(true)}>
              <AlignedLabel>
                <FaCirclePlus className="me-2" />
                <span>Create crash record</span>
              </AlignedLabel>
            </Button>
          </PermissionsRequired>
        </Card.Header>
        <Card.Body>
          <TableWrapper
            columns={crashesListViewColumns}
            initialQueryConfig={crashesListViewQueryConfig}
            localStorageKey={localStorageKey}
            refetch={refetch}
          />
        </Card.Body>
      </Card>
      <CreateCrashRecordModal
        onClose={onCloseModal}
        show={showNewUserModal}
        onSubmitCallback={onSaveCallback}
      />
    </>
  );
}
