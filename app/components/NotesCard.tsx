import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { CrashNote } from "@/types/crashNote";
import { FaCirclePlus } from "react-icons/fa6";
import NotesModal from "./NotesModal";
import { INSERT_CRASH_NOTE, UPDATE_CRASH_NOTE } from "@/queries/notes";
import RelatedRecordTable from "./RelatedRecordTable";
import { ColDataCardDef } from "@/types/types";

// ✅ A new "Notes" card on the crash details page with a table that displays notes
// Ability to add a new note inline
// Ability to edit an existing note by clicking on the note text
// And show the save/cancel buttons in the card footer while editing. Save should be disabled unless the note value has changed 

// additional self imposed requirements:
// - react-hook-form? 
// - col width should be tidy
// - empty state
// - format datetime


interface NotesCardProps {
  notes: CrashNote[];
  crashPk: number;
  onSaveCallback: () => Promise<void>;
}

const notesColumns: ColDataCardDef<CrashNote>[] = [
  {
    path: "date",
    label: "Date",
    editable: false,
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
  },
];

export default function NotesCard({ notes, crashPk, onSaveCallback }: NotesCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSaveNote = async (data: CrashNote) => {
    try {
      setIsValidating(true);
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: INSERT_CRASH_NOTE,
          variables: {
            crashPk: data.crash_pk,
            text: data.text,
            userEmail: data.user_email,
          },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        console.error('Error saving note:', result.errors);
        return;
      }

      await onSaveCallback();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsValidating(false);
    }
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
          footer={
            <Button
            size="sm"
            variant="primary"
            onClick={handleShow}
          >
            <FaCirclePlus className="me-2" />
              Add Note
            </Button>
          }
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

