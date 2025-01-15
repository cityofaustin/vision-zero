import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import { CrashNote } from "@/types/crashNote";

interface NotesModalProps {
  show: boolean;
  onClose: () => void;
  onSubmitCallback: (data: CrashNote) => void;
  crashPk?: number;
}

export default function NotesModal({ show, onClose, onSubmitCallback, crashPk }: NotesModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    const noteData = {
      ...data,
      crash_pk: crashPk,
      user_email: "current_user@email.com", // You'll need to get this from your auth system
    };
    onSubmitCallback(noteData);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter note text..."
              isInvalid={Boolean(errors.text)}
              autoFocus
            />
            {errors.text && (
              <Form.Control.Feedback type="invalid">
                Note text is required
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Note
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 