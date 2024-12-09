import { useToken } from "@/utils/auth";
import Form from "react-bootstrap/Form";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

type NewUserInputs = {
  name: string;
  email: string;
  app_metadata: { roles: string[] };
};

export default function NewUserForm() {
  const token = useToken();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewUserInputs>({
    defaultValues: {
      name: undefined,
      email: undefined,
      app_metadata: { roles: ["readonly"] },
    },
  });

  const onSubmit: SubmitHandler<NewUserInputs> = (data) => {
    const url = `${process.env.NEXT_PUBLIC_CR3_API_DOMAIN}/user/create_user`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "post",
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((whatever) => {
        console.log("WHATEVER", whatever);
      });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} id="newUserForm">
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          {...register("name", { required: true })}
          autoComplete="off"
          data-1p-ignore
          placeholder="Name"
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
          placeholder="Email"
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
    </Form>
  );
}
