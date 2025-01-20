import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { CrashNote } from "@/types/crashNote";
import { FaCirclePlus } from "react-icons/fa6";
import NotesModal from "./NotesModal";
import { INSERT_CRASH_NOTE, UPDATE_CRASH_NOTE } from "@/queries/notes";
import RelatedRecordTable from "./RelatedRecordTable";
import { ColDataCardDef } from "@/types/types";
import { useAuth0 } from "@auth0/auth0-react";
import { gql } from "graphql-request";
import { formatDate } from "@/utils/formatters";

// ✅ A new "Notes" card on the crash details page with a table that displays notes
// ✅ Ability to add a new note via modal
// Ability to add a new note inline
// Ability to edit an existing note by clicking on the note text
// ✅ And show the save/cancel buttons in the card footer while editing. Save should be disabled unless the note value has changed 

// additional self imposed requirements:
// ✅ - react-hook-form? 
// ✅ - col width should be tidy
// ✅ - empty state
// ✅ - format datetime


interface NotesCardProps {
  notes: CrashNote[];
  crashPk: number;
  onSaveCallback: () => Promise<void>;
  refetch: () => Promise<any>;
}

const notesColumns: ColDataCardDef<CrashNote>[] = [
  {
    path: "date",
    label: "Date",
    editable: false,
    valueFormatter: formatDate,
  },
  {
    path: "user_email",
    label: "User",
    editable: false,
  },
  {
    path: "text",
    label: "Note",
    editable: true,
    inputType: "textarea",
    style: { minWidth: "350px" },
  },
];

const AddNoteButton = (handleShow: () => void) => {
  return (
    <Button
      size="sm"
      variant="primary"
      onClick={handleShow}
    >
      <FaCirclePlus className="me-2" />
      Add Note
    </Button>
  );
};

const NotesCard = ({ notes, crashPk, refetch, onSaveCallback }: NotesCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { user } = useAuth0();
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSaveNote = async (data: CrashNote) => {
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
          footer={AddNoteButton(handleShow)}
        />

      <NotesModal
        show={showModal}
        onClose={handleClose}
        onSubmitCallback={handleSaveNote}
        crashPk={crashPk}
      />
    </>
  );
}

export default NotesCard;