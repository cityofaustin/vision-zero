import Modal from "react-bootstrap/Modal";
import { Form } from "react-bootstrap";
// import Button from "react-bootstrap/Button";

interface EditCrashAddressModalProps {
  /**
   * A callback fired when either the modal backdrop is clicked, or the
   * escape key is pressed
   */
  onClose: () => void;
  /**
   *  Callback fired after the user form is successfully submitted
   */
  // onSubmitCallback: () => void;
  // /**
  //  * If the modal should be visible or hidden
  //  */
  show: boolean;
}

/**
 * Modal form component used for creating or editing a user
 */
export default function EditCrashAddressModal({
  onClose,
  // onSubmitCallback,
  show,
}: EditCrashAddressModalProps) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>Edit crash address</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Street number</Form.Label>
            <Form.Control data-1p-ignore />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Street prefix</Form.Label>
            <Form.Control data-1p-ignore />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Street name</Form.Label>
            <Form.Control data-1p-ignore />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Street suffix</Form.Label>
            <Form.Control data-1p-ignore />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Street description</Form.Label>
            <Form.Control data-1p-ignore />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Roadway part</Form.Label>
            <Form.Control data-1p-ignore />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Roadway system</Form.Label>
            <Form.Control data-1p-ignore />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Highway number</Form.Label>
            <Form.Control data-1p-ignore />
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
