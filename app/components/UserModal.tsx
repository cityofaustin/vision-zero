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
  onClose: () => void;
  onSubmitCallback: (user: User) => Promise<void>;
  show: boolean;
  user?: User;
}

type UserInputs = {
  name: string;
  email: string;
  app_metadata: { roles: string[] };
};

const USER_DEFAULTS = {
  name: undefined,
  email: undefined,
  app_metadata: { roles: ["readonly"] },
};

export default function UserModal({
  onClose,
  onSubmitCallback,
  show,
  user,
}: UserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = useToken();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<UserInputs>({
    defaultValues: user
      ? { name: user.name, email: user.email, app_metadata: user.app_metadata }
      : USER_DEFAULTS,
  });

  const onSubmit: SubmitHandler<UserInputs> = async (data) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    const url = user
      ? `${
          process.env.NEXT_PUBLIC_CR3_API_DOMAIN
        }/user/update_user/${encodeURIComponent(user.user_id)}`
      : `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/user/create_user`;

    const method = user ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method,
        body: JSON.stringify(data),
      });
      const responseJson: User | UserAPIError = await response.json();
      if ("user_id" in responseJson) {
        await onSubmitCallback(responseJson);
      } else if ("message" in responseJson) {
        setErrorMessage(responseJson.message);
      } else {
        console.error(responseJson);
        setErrorMessage("An unknown error has occured");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An unknown error has occured");
    }
    setIsSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onClose} animation={false} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{user ? "Edit user" : "New user"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)} id="userForm">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              {...register("name", { required: true })}
              autoComplete="off"
              data-1p-ignore
              placeholder="Enter name..."
              isInvalid={Boolean(errors.name)}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              Name is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              {...register("email", { required: true })}
              autoComplete="off"
              placeholder="Enter email..."
              isInvalid={Boolean(errors.email)}
              data-1p-ignore
            />
            <Form.Control.Feedback type="invalid">
              Email is required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="userRole">
            <Form.Label>Role</Form.Label>
            <div>
              <Controller
                name="app_metadata.roles.0"
                control={control}
                render={({ field }) => (
                  <>
                    <Form.Check
                      {...field}
                      type="radio"
                      label="Read-only"
                      value="readonly"
                      inline
                      id="readonly"
                      checked={field.value === "readonly"}
                    />
                    <Form.Check
                      {...field}
                      type="radio"
                      label="Editor"
                      value="editor"
                      inline
                      id="editor"
                      checked={field.value === "editor"}
                    />
                    <Form.Check
                      {...field}
                      type="radio"
                      label="Admin"
                      value="vz-admin"
                      inline
                      id="admin"
                      checked={field.value === "vz-admin"}
                    />
                  </>
                )}
              />
            </div>
          </Form.Group>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {!isSubmitting && (
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          type="submit"
          form="userForm"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting && <Spinner size="sm" />}
          {!isSubmitting && <span>{user ? "Save" : "Create user"}</span>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
