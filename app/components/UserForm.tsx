import { useToken } from "@/utils/auth";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { User, UserAPIError } from "@/types/users";
import { useState } from "react";

type UserInputs = {
  name: string;
  email: string;
  app_metadata: { roles: string[] };
};

type UserFormProps = {
  onSubmitCallback: (user: User) => void;
  user?: User;
};

const USER_DEFAULTS = {
  name: undefined,
  email: undefined,
  app_metadata: { roles: ["readonly"] },
};

export default function UserForm({ onSubmitCallback, user }: UserFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = useToken();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserInputs>({
    defaultValues: user
      ? { name: user.name, email: user.email, app_metadata: user.app_metadata }
      : USER_DEFAULTS,
  });

  const onSubmit: SubmitHandler<UserInputs> = async (data) => {
    // clear any previous error
    setErrorMessage(null);
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
        // assume it's a user object
        onSubmitCallback(responseJson);
      } else if ("message" in responseJson) {
        setErrorMessage(responseJson.message);
      } else {
        // not sure what this is
        console.error(responseJson);
        setErrorMessage("An unknown error has occured");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An unknown error has occured");
    }
  };

  return (
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
  );
}
