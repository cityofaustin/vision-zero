import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { ListGroup } from "react-bootstrap";
import { useState } from "react";
import { LuCirclePlus } from "react-icons/lu";
import NotesModal from "./NotesModal";
import AlignedLabel from "@/components/AlignedLabel";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import PermissionsRequired from "@/components/PermissionsRequired";
import { CrashNote } from "@/types/crashNote";
import { formatDate, formatUserNameFromEmail } from "@/utils/formatters";
import { LuSquarePen } from "react-icons/lu";
import { LocationNote } from "@/types/locationNote";

const allowedNoteRoles = ["vz-admin", "editor"];

interface NotesCardProps<T extends CrashNote | LocationNote> {
  notes: T[];
  updateMutation: string;
  insertMutation: string;
  recordId: number | string;
  recordKey: keyof T; // 'crash_pk' or 'location_id';
  onSaveCallback: () => Promise<void>;
}

const AddNoteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <PermissionsRequired allowedRoles={allowedNoteRoles}>
      <Button size="sm" variant="primary" onClick={onClick}>
        <AlignedLabel>
          <LuCirclePlus className="me-2" />
          Add note
        </AlignedLabel>
      </Button>
    </PermissionsRequired>
  );
};

/**
 * UI component for adding a note to a crash
 */
export default function NotesCard<T extends CrashNote | LocationNote>({
  notes,
  updateMutation,
  insertMutation,
  recordId,
  recordKey,
  onSaveCallback,
}: NotesCardProps<T>) {
  const [editNote, setEditNote] = useState<Partial<T> | null>(null);
  const handleCloseModal = () => {
    setEditNote(null);
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between">
        <Card.Title>Notes</Card.Title>
        <AddNoteButton
          // type assertion here because TS can't figure out that `text` satifies a partial<T>
          onClick={() => setEditNote({ text: "" } as Partial<T>)}
        />
      </Card.Header>
      <Card.Body>
        {notes.length === 0 && <div className="text-secondary">No notes</div>}
        <ListGroup variant="flush">
          {notes.map((note) => {
            return (
              <ListGroup.Item key={note.id} className="py-2 mb-0 pe-0">
                <div style={{ whiteSpace: "pre-wrap" }} className="pb-0">
                  {note.text}
                </div>
                <div className="d-flex justify-content-between text-secondary">
                  <div>
                    <small>
                      <span className="">
                        {formatUserNameFromEmail(note.updated_by)}
                      </span>
                      <span>{` on `}</span>
                      <span className="text-nowrap">
                        {formatDate(note.updated_at)}
                      </span>
                    </small>
                  </div>
                  <PermissionsRequired allowedRoles={allowedNoteRoles}>
                    <div className="d-flex align-self-start mt-2">
                      <Button
                        className="me-2"
                        size="sm"
                        onClick={() => setEditNote(note)}
                      >
                        <AlignedLabel>
                          <LuSquarePen className="me-2" />
                          Edit
                        </AlignedLabel>
                      </Button>
                      <DeleteNoteButton
                        mutation={updateMutation}
                        record={note}
                        onSaveCallback={onSaveCallback}
                      />
                    </div>
                  </PermissionsRequired>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
      {editNote && (
        <NotesModal<T>
          note={editNote}
          show={true}
          handleCloseModal={handleCloseModal}
          onSubmitCallback={onSaveCallback}
          recordId={recordId}
          recordKey={recordKey}
          insertMutation={insertMutation}
          updateMutation={updateMutation}
        />
      )}
    </Card>
  );
}
