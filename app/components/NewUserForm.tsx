import Form from "react-bootstrap/Form";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

type NewUserInputs = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export default function NewUserForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewUserInputs>({
    defaultValues: {
      name: undefined,
      email: undefined,
      password: undefined,
      role: "readonly",
    },
  });
  const onSubmit: SubmitHandler<NewUserInputs> = (data) => console.log(data);
  return (
    <Form onSubmit={handleSubmit(onSubmit)} id="newUserForm">
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          {...register("name", { required: true })}
          autoComplete="off"
          data-1p-ignore
          placeholder="Name"
          autoFocus
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="userEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          {...register("email")}
          autoComplete="off"
          placeholder="Email"
          data-1p-ignore
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="userPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          {...register("password")}
          type="password"
          placeholder="Password"
          autoComplete="new-password"
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="userRole">
        <Form.Label>Role</Form.Label>
        <div>
          <Controller
            name="role"
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
