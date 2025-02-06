import Button from "react-bootstrap/Button";
import { useState } from "react";
import { CrashNote } from "@/types/crashNote";
import { FaCirclePlus } from "react-icons/fa6";
import NotesModal from "./NotesModal";
import { UPDATE_CRASH_NOTE } from "@/queries/notes";
import RelatedRecordTable from "./RelatedRecordTable";
import { ColDataCardDef } from "@/types/types";
import { formatDate } from "@/utils/formatters";
import AlignedLabel from "@/components/AlignedLabel";
import CrashDeleteNoteButton from "@/components/CrashDeleteNoteButton";
import PermissionsRequired from "@/components/PermissionsRequired";

const allowedAddCrashNoteRoles = ["vz-admin", "editor"];

interface CrashNotesCardProps {
  notes: CrashNote[];
  crashPk: number;
  onSaveCallback: () => Promise<void>;
  refetch: () => Promise<void>;
}

const notesColumns: ColDataCardDef<CrashNote>[] = [
  {
    path: "created_at",
    label: "Created at",
    editable: false,
    valueFormatter: formatDate,
  },
  {
    path: "updated_by",
    label: "Updated by",
    editable: false,
  },
  {
    path: "text",
    label: "Note",
    editable: true,
    inputType: "textarea",
    required: true,
    style: { minWidth: "350px" },
    validation: (value: string) => {
      // Example of custom validation
      if (value.trim().length < 3) {
        return "Note must be at least 3 characters";
      }
      return true;
    } 
  },
];

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
const CrashNotesCard = ({
  notes,
  crashPk,
  onSaveCallback,
}: CrashNotesCardProps) => {
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
        mutation={UPDATE_CRASH_NOTE}
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
        crashPk={crashPk}
      />
    </>
  );
};

export default CrashNotesCard;
