import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm, SubmitHandler } from "react-hook-form";
import { CrashNote } from "@/types/crashNote";
import { INSERT_CRASH_NOTE } from "@/queries/notes";
import { useMutation } from "@/utils/graphql";
import { useAuth0 } from "@auth0/auth0-react";

interface NotesModalProps {
  show: boolean;
  onClose: () => void;
  onSubmitCallback: (data: CrashNote) => void;
  crashPk?: number;
}

interface NoteFormInputs {
  text: string;
}

export default function NotesModal({
  show,
  onClose,
  onSubmitCallback,
  crashPk,
}: NotesModalProps) {
  const { user } = useAuth0();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormInputs>();
  const { mutate, loading: isSubmitting } = useMutation(INSERT_CRASH_NOTE);

  const onSubmit: SubmitHandler<NoteFormInputs> = async (data) => {
    const noteData = {
      ...data,
      crashPk: crashPk,
      userEmail: user?.email,
    };
    const responseData = await mutate<{
      insert_crash_notes_one: { returning: CrashNote };
    }>(noteData);
    if (responseData && responseData.insert_crash_notes_one) {
      onSubmitCallback(responseData.insert_crash_notes_one.returning);
    }
    reset();
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={handleSubmit(onSubmit)} id="noteForm">
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
              {...register("text", { required: true })}
            />
            {errors.text && (
              <Form.Control.Feedback type="invalid">
                Note text is required
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            type="submit"
            form="noteForm"
            disabled={isSubmitting}
          >
            Save note
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
