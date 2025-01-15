import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/esm/Form";
import { useForm } from "react-hook-form";
import { CrashNote } from "@/types/crashNote";
import Table from "react-bootstrap/esm/Table";

// ✅ A new "Notes" card on the crash details page with a table that displays notes
// Ability to add a new note
// Ability to edit an existing note by clicking on the note text
// And show the save/cancel buttons in the card footer while editing. Save should be disabled unless the note value has changed 

interface NotesCardProps {
  notes: CrashNote[];
  columns: { name: string; key: string }[];
  onSaveCallback: (data: any) => void;
}



export default function NotesCard({ notes, onSaveCallback }: NotesCardProps) {
  const { handleSubmit } = useForm();

  const columns = [ 
    { "name": "Date", "key": "date" },
    { "name": "User", "key": "user_email" },
    { "name": "Note", "key": "text" }
];

  const onSave = (data: any) => {
    console.log(data);
  };

  console.log("NotesCard notes:", notes);

  return (
    <Card>
      <Card.Header>Notes</Card.Header>
      <Card.Body>
        <Table striped hover>
          <thead>
            <tr>
              {columns.map((column) => (
                <th>{column.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => {
                return (
                    <tr>
                    {columns.map((column) => (
                        <td key={column.key}>{note[column.key as keyof CrashNote]}</td>
                    ))}
                    </tr>
                );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

