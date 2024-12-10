import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

interface NewUserModalProps {
  children: React.ReactNode;
  onClose: () => void;
  mode: "create" | "update";
  show: boolean;
}

export default function UserModal({
  children,
  onClose,
  mode,
  show,
}: NewUserModalProps) {
  return (
    <Modal show={show} onHide={onClose} animation={false} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "create" ? "New user" : "Update user"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="userForm">
          {mode === "create" ? "Create user" : "Update user"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
