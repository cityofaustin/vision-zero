import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@/utils/graphql";
import { useAuth0 } from "@auth0/auth0-react";
import { CrashNote } from "@/types/crashNote";
import { useRef } from "react";
import { LocationNote } from "@/types/locationNote";

interface NotesModalProps<T extends CrashNote | LocationNote> {
  show: boolean;
  handleCloseModal: () => void;
  onSubmitCallback: () => void;
  insertMutation: string;
  updateMutation: string;
  note: Partial<T>;
  recordKey: keyof T; // 'crash_pk' or 'location_id'
  recordId?: number | string;
}

interface NoteFormInputs {
  text: string;
}

export default function NotesModal<T extends CrashNote | LocationNote>({
  show,
  handleCloseModal,
  onSubmitCallback,
  recordId,
  recordKey,
  insertMutation,
  updateMutation,
  note,
}: NotesModalProps<T>) {
  const { user } = useAuth0();
  // we need a ref to ensure autofocus inside the modal
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormInputs>({
    defaultValues: { text: note?.text || "" },
  });
  const isEditing = note.id;

  const { mutate, loading: isSubmitting } = useMutation(
    isEditing ? updateMutation : insertMutation
  );

  const onSubmit: SubmitHandler<NoteFormInputs> = async (data) => {
    const updates = {
      text: data.text,
      [recordKey]: recordId,
      updated_by: user?.email,
    } as Partial<T>;

    let variables;

    if (isEditing) {
      variables = {
        updates,
        id: note.id,
      };
    } else {
      updates.created_by = user?.email;
      variables = { updates };
    }

    const responseData = await mutate(variables);
    if (!!responseData) {
      onSubmitCallback();
    }
    reset();
    handleCloseModal();
  };

  const { ref: registerRef, ...rest } = register("text", { required: true });

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
      onEntered={() => textareaRef.current?.focus()}
    >
      <Form onSubmit={handleSubmit(onSubmit)} id="noteForm">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Edit note" : "Add Note"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder="Enter note text..."
              isInvalid={Boolean(errors.text)}
              ref={(e) => {
                registerRef(e);
                textareaRef.current = e;
              }}
              autoFocus
              {...rest}
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
            {isSubmitting ? "Saving..." : "Save note"}
          </Button>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
