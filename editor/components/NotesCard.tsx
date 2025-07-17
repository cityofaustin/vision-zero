import Button from "react-bootstrap/Button";
import { useState } from "react";
import { FaCirclePlus } from "react-icons/fa6";
import NotesModal from "./NotesModal";
import RelatedRecordTable from "./RelatedRecordTable";
import { ColDataCardDef } from "@/types/types";
import AlignedLabel from "@/components/AlignedLabel";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import PermissionsRequired from "@/components/PermissionsRequired";

const allowedNoteRoles = ["vz-admin", "editor"];

interface NotesCardProps<T extends Record<string, unknown>> {
  notes: T[];
  updateMutation: string;
  insertMutation: string;
  notesColumns: ColDataCardDef<T>[];
  recordId: number | string;
  onSaveCallback: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AddNoteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <PermissionsRequired allowedRoles={allowedNoteRoles}>
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
  recordId,
  onSaveCallback,
}: NotesCardProps<T>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = () => setIsModalOpen(true);

  return (
    <>
      <RelatedRecordTable
        records={notes}
        columns={notesColumns}
        mutation={updateMutation}
        rowActionMutation={updateMutation}
        noRowsMessage="No notes found"
        isValidating={false}
        header="Notes"
        headerButton={<AddNoteButton onClick={handleOpenModal} />}
        onSaveCallback={onSaveCallback}
        rowActionComponent={DeleteNoteButton}
      />

      <NotesModal
        show={isModalOpen}
        handleCloseModal={handleCloseModal}
        onSubmitCallback={onSaveCallback}
        recordId={recordId}
        insertMutation={insertMutation}
      />
    </>
  );
}
