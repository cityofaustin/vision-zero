import { Modal, Button, Form } from "react-bootstrap";

interface ChargesModalProps {
  show: boolean;
  setShowChargesModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSaveCallback: () => Promise<void>;
}

export default function ChargesModal({
  show,
  setShowChargesModal,
  onSaveCallback,
}: ChargesModalProps) {
  return (
    <Modal
      show={show}
      // onHide={onClose}
      onExited={() => {
        // reset();
      }}
    >
      <Modal.Header>
        <Modal.Title>Edit charges</Modal.Title>
      </Modal.Header>
      <Modal.Body></Modal.Body>
      <Modal.Footer>
        <Button
          // disabled={!isDirty || isSubmitting}
          form="contribFactorsForm"
          type="submit"
        >
          Save
        </Button>
        <Button
          variant="secondary"
          // onClick={() => {
          //   onClose();
          //   reset();
          // }}
          // disabled={isSubmitting}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
