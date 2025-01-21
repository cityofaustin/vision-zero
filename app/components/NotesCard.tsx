import Button from "react-bootstrap/Button";
import { useState } from "react";
import { CrashNote } from "@/types/crashNote";
import { FaCirclePlus } from "react-icons/fa6";
import NotesModal from "./NotesModal";
import { UPDATE_CRASH_NOTE, DELETE_CRASH_NOTE } from "@/queries/notes";
import RelatedRecordTable from "./RelatedRecordTable";
import { ColDataCardDef } from "@/types/types";
import { formatDate } from "@/utils/formatters";
import { useAuth0 } from "@auth0/auth0-react";

interface NotesCardProps {
  notes: CrashNote[];
  crashPk: number;
  onSaveCallback: () => Promise<void>;
  refetch: () => Promise<void>;
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
    editableCheck: (record: CrashNote, currentUserEmail?: string) =>
      record.user_email === currentUserEmail,
    inputType: "textarea",
    style: { minWidth: "350px" },
  },
  {
    path: "actions",
    label: "",
    editable: false,
    style: { width: "50px" },
  },
];

const AddNoteButton = (handleShow: () => void) => {
  return (
    <Button size="sm" variant="primary" onClick={handleShow}>
      <FaCirclePlus className="me-2" />
      Add Note
    </Button>
  );
};

const NotesCard = ({ notes, crashPk, onSaveCallback }: NotesCardProps) => {
  const { user } = useAuth0();
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
        deleteMutation={DELETE_CRASH_NOTE}
        mutationVariables={(variables: {
          id: number;
          updates: Record<string, unknown>;
        }) => ({
          id: variables.id,
          updates: {
            text: variables.updates.text,
          },
        })}
        isValidating={isValidating}
        title="Notes"
        onSaveCallback={onSaveCallback}
        footer={AddNoteButton(handleShow)}
        currentUserEmail={user?.email}
        quickEditColumn="text"
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

export default NotesCard;
