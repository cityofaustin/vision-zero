import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useState } from "react";
import { LuCirclePlus } from "react-icons/lu";
import NotesModal from "./NotesModal";
import { ColDataCardDef } from "@/types/types";
import AlignedLabel from "@/components/AlignedLabel";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import PermissionsRequired from "@/components/PermissionsRequired";
import { CrashNote } from "@/types/crashNote";
import { formatDate, formatUserName } from "@/utils/formatters";
import { LuSquarePen } from "react-icons/lu";

const allowedNoteRoles = ["vz-admin", "editor"];

interface NotesCardProps {
  notes: CrashNote[];
  updateMutation: string;
  insertMutation: string;
  recordId: number;
  onSaveCallback: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AddNoteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <PermissionsRequired allowedRoles={allowedNoteRoles}>
      <Button size="sm" variant="primary" onClick={onClick}>
        <AlignedLabel>
          <LuCirclePlus className="me-1" />
          Add note
        </AlignedLabel>
      </Button>
    </PermissionsRequired>
  );
};

/**
 * UI component for adding a note to a crash
 */
export default function NotesCard({
  notes,
  updateMutation,
  insertMutation,
  recordId,
  onSaveCallback,
}: NotesCardProps) {
  const [editNote, setEditNote] = useState<Partial<CrashNote> | null>(null);
  const handleCloseModal = () => {
    setEditNote(null);
  };

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between">
        <Card.Title>Notes</Card.Title>
        <AddNoteButton onClick={() => setEditNote({ text: "" })} />
      </Card.Header>
      <Card.Body>
        {notes.length === 0 && <div className="text-secondary">No notes</div>}
        {notes.map((note) => {
          return (
            <Card className="mb-2" key={note.id}>
              <Card.Body style={{ whiteSpace: "pre-wrap" }}>
                {note.text}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between border-top text-secondary">
                <div>
                  <small>
                    <span className="">{formatUserName(note.updated_by)}</span>
                    <span>{` on `}</span>
                    <span className="text-nowrap">
                      {formatDate(note.updated_at)}
                    </span>
                  </small>
                </div>
                <div className="d-flex align-self-start">
                  <DeleteNoteButton
                    mutation={updateMutation}
                    record={note}
                    onSaveCallback={onSaveCallback}
                  />
                  <Button
                    className="ms-2"
                    size="sm"
                    onClick={() => setEditNote(note)}
                  >
                    <AlignedLabel>
                      <LuSquarePen className="me-1" />
                      Edit
                    </AlignedLabel>
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          );
        })}
      </Card.Body>
      {editNote && (
        <NotesModal
          note={editNote}
          show={true}
          handleCloseModal={handleCloseModal}
          onSubmitCallback={onSaveCallback}
          recordId={recordId}
          insertMutation={insertMutation}
          updateMutation={updateMutation}
        />
      )}
    </Card>
  );
}
