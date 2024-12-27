"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import AlignedLabel from "@/components/AlignedLabel";
import AppBreadCrumb from "@/components/AppBreadCrumb";
import CreateCrashRecordModal from "@/components/CreateCrashRecordModal";
import TableWrapper from "@/components/TableWrapper";
import { FaCirclePlus } from "react-icons/fa6";
import { tempCrashesListViewQueryConfig } from "@/configs/tempCrashesTable";
import { crashesListViewColumns } from "@/configs/crashesListViewColumns";
import { Crash } from "@/types/crashes";

const localStorageKey = "tempCrashesListViewQueryConfig";

export default function CreateCrashRecord() {
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
        <Card.Header className="fs-5 fw-bold">Temporary records</Card.Header>
        <Card.Body>
          <div>
            <Button className="me-2" onClick={() => setShowNewUserModal(true)}>
              <AlignedLabel>
                <FaCirclePlus className="me-2" />
                <span>Create crash record</span>
              </AlignedLabel>
            </Button>
          </div>
          {/* todo: create column array for this page */}
          <TableWrapper
            columns={crashesListViewColumns}
            initialQueryConfig={tempCrashesListViewQueryConfig}
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
