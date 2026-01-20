import { Modal, Button, Form } from "react-bootstrap";
import { Dispatch, SetStateAction } from "react";

interface FatalityImageUploadModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  victimName: string;
}

export default function FatalityImageUploadModal({
  showModal,
  setShowModal,
  victimName,
}: FatalityImageUploadModalProps) {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header>
        <Modal.Title>{`Photo | ${victimName}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Control
            type="file"
            name="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSuccess(false);
              if (validationErrors) {
                setValidationErrors(null);
              }
              if (e.target?.files && e.target?.files.length > 0) {
                setParsing(true);
                onSelectFile(e.target?.files[0]);
                // reset file input
                e.target.value = "";
              } else {
                setParsing(false);
              }
            }}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          type="submit"
          // disabled={isSubmitting}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setShowModal(false);
          }}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
