import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { CrashNote } from "@/types/crashNote";
import { FaCirclePlus } from "react-icons/fa6";
import NotesModal from "./NotesModal";
import { INSERT_CRASH_NOTE } from "@/queries/notes";

// ✅ A new "Notes" card on the crash details page with a table that displays notes
// Ability to add a new note
// Ability to edit an existing note by clicking on the note text
// And show the save/cancel buttons in the card footer while editing. Save should be disabled unless the note value has changed 

// additional self imposed requirements:
// - react-hook-form? 
// - col width should be tidy
// - empty state


interface NotesCardProps {
  notes: CrashNote[];
  crashPk: number;
  onSaveCallback: () => Promise<void>;
}

  const columns = [ 
    { "name": "Date", "key": "date" },
    { "name": "User", "key": "user_email" },
    { "name": "Note", "key": "text" }
];

export default function NotesCard({ notes, crashPk, onSaveCallback }: NotesCardProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSaveNote = async (data: CrashNote) => {
    try {
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

      // Trigger refresh of notes list
      onSaveCallback(result.data.insert_crash_notes_one);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <>
      <Card>
        <Card.Header>Notes</Card.Header>
        <Card.Body>
          <Table striped hover>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notes.map((note, index) => (
                <tr key={`note-${index}`}>
                  {columns.map((column) => (
                    <td key={`${column.key}-${index}`}>
                      {note[column.key as keyof CrashNote]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="text-end">
          <Button
            size="sm"
            variant="primary"
            onClick={handleShow}
          >
            <FaCirclePlus className="me-2" />
            Add Note
          </Button>
        </Card.Footer>
      </Card>

      <NotesModal
        show={showModal}
        onClose={handleClose}
        onSubmitCallback={handleSaveNote}
        crashPk={crashPk}
      />
    </>
  );
}

