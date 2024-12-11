import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { User, UserAPIError } from "@/types/users";
import { useToken } from "@/utils/auth";

interface UserModalProps {
  /**
   * A callback fired when either the modal backdrop is clicked, or the
   * escape key is pressed
   */
  onClose: () => void;
  /**
   * An async callback fired after the user form is successfully submitted
   */
  onSubmitCallback: (user: User) => Promise<void>;
  /**
   * If the modal should be visible or hidden
   */
  show: boolean;
  /**
   * An optional User object to be edited by this component. If not defined, a new user
   * will be created on submit
   */
  userId: string;
}

/**
 * Modal component for deleting a user
 */
export default function DeleteUserModal({
  onClose,
  onSubmitCallback,
  show,
  userId,
}: UserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = useToken();

  const onSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const url = `${
      process.env.NEXT_PUBLIC_CR3_API_DOMAIN
    }/user/delete_user/${encodeURIComponent(userId)}`;

    const method = "DELETE";
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method,
      });
      const responseJson: User | UserAPIError = await response.json();
      console.log("RESPONSE", responseJson);
      //   if ("user_id" in responseJson) {
      //     await onSubmitCallback(responseJson);
      //   } else if ("message" in responseJson) {
      //     setErrorMessage(responseJson.message);
      //   } else {
      //     console.error(responseJson);
      //     setErrorMessage("An unknown error has occured");
      //   }
    } catch (err) {
      console.error(err);
      setErrorMessage("An unknown error has occured");
    }
    setIsSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onClose} animation={false} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Delete user</Modal.Title>
      </Modal.Header>
      <Modal.Body></Modal.Body>
      <Modal.Footer>
        {!isSubmitting && (
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner size="sm" />}
          {!isSubmitting && <span>Delete user</span>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
