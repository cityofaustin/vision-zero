import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@/utils/graphql";
import { useAuth0 } from "@auth0/auth0-react";

interface NotesModalProps {
  show: boolean;
  handleCloseModal: () => void;
  onSubmitCallback: () => void;
  recordId?: number | string;
  insertMutation: string;
}

interface NoteFormInputs {
  text: string;
}

export default function NotesModal({
  show,
  handleCloseModal,
  onSubmitCallback,
  recordId,
  insertMutation,
}: NotesModalProps) {
  const { user } = useAuth0();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormInputs>();
  const { mutate, loading: isSubmitting } = useMutation(insertMutation);

  const onSubmit: SubmitHandler<NoteFormInputs> = async (data) => {
    const noteData = {
      ...data,
      recordId: recordId,
      userEmail: user?.email,
    };
    const responseData = await mutate(noteData);
    if (!!responseData) {
      onSubmitCallback();
    }
    reset();
    handleCloseModal();
  };

  return (
    <Modal show={show} onHide={handleCloseModal}>
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
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
