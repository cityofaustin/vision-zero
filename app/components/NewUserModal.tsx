import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import NewUserForm from "./NewUserForm";

interface NewUserModalProps {
  onClose: () => void;
}

export default function NewUserModal({ onClose }: NewUserModalProps) {
  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>New user</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NewUserForm />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="newUserForm">
          Create user
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
