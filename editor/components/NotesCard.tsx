import Button from "react-bootstrap/Button";
import { useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import NotesModal from "./NotesModal";
import RelatedRecordTable from "./RelatedRecordTable";
import { ColDataCardDef } from "@/types/types";
import AlignedLabel from "@/components/AlignedLabel";
import CrashDeleteNoteButton from "@/components/DeleteNoteButton";
import PermissionsRequired from "@/components/PermissionsRequired";

const allowedAddCrashNoteRoles = ["vz-admin", "editor"];

interface NotesCardProps<T extends Record<string, unknown>> {
  notes: T[];
  updateMutation: string;
  insertMutation: string;
  deleteMutation: string;
  notesColumns: ColDataCardDef<T>[];
  recordId: number | string;
  onSaveCallback: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AddNoteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <PermissionsRequired allowedRoles={allowedAddCrashNoteRoles}>
      <Button size="sm" variant="primary" onClick={onClick}>
        <AlignedLabel>
          <FaCirclePlus className="me-2" />
          Add note
        </AlignedLabel>
      </Button>
    </PermissionsRequired>
  );
};

/**
 * UI component for adding a note to a crash
 */
export default function NotesCard<T extends Record<string, unknown>>({
  notes,
  notesColumns,
  updateMutation,
  insertMutation,
  deleteMutation,
  recordId,
  onSaveCallback,
}: NotesCardProps<T>) {
  const [showModal, setShowModal] = useState(false);
  const [isValidating] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSaveNote = async () => {
    await onSaveCallback();
  };

  return (
    <>
      <RelatedRecordTable
        records={notes}
        columns={notesColumns}
        mutation={updateMutation}
        rowActionMutation={deleteMutation}
        isValidating={isValidating}
        title="Notes"
        onSaveCallback={onSaveCallback}
        headerActionComponent={<AddNoteButton onClick={handleShow} />}
        rowActionComponent={CrashDeleteNoteButton}
      />

      <NotesModal
        show={showModal}
        onClose={handleClose}
        onSubmitCallback={handleSaveNote}
        recordId={recordId}
        insertMutation={insertMutation}
      />
    </>
  );
}
