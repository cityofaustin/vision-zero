import { useForm, RegisterOptions } from "react-hook-form";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { InputType } from "@/types/types";
import { LookupTableOption } from "@/types/relationships";
import { useState } from "react";

interface EditableFieldProps {
  /** The initial value to populate the input */
  initialValue: string;
  /** If the input is in the process of mutating via API call */
  isMutating: boolean;
  /** Controls the type of input to be rendered */
  inputType?: InputType;
  /** Array of lookup table options that will populate a <select> input */
  selectOptions?: LookupTableOption[];
  /** If there was a graphql error when fetching the select options */
  selectOptionsError?: unknown;
  /**
   * The function to call on save button click, which is expected to mutate the field
   * with the current `editValue`
   */
  onSave: (value: string) => Promise<void>;
  /**
   * The function to call on cancel button click, which is expected
   * to set control the parent component's edit state
   */
  onCancel: () => void;
  /** Validation rules that mirror react-hook-form RegisterOptions */
  inputOptions?: RegisterOptions<FormValues, "value">;
  /** Function that gets the message to be displayed in the case of a graphql mutation error */
  getMutationErrorMessage?: (error: unknown) => string | null;
}

interface FormValues {
  value: string;
}

/**
 * Component that manages the form UI for a single
 * editable field
 */
export default function EditableField({
  initialValue,
  inputType,
  isMutating,
  selectOptions,
  selectOptionsError,
  onSave,
  onCancel,
  inputOptions,
  getMutationErrorMessage,
}: EditableFieldProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      value: initialValue,
    },
  });

  // Sets the message to be shown if there was an error in the graphql mutation
  const [mutationError, setMutationError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    await onSave(data.value).catch((error) => {
      setMutationError(
        getMutationErrorMessage
          ? getMutationErrorMessage(error)
          : "Something went wrong"
      );
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-2">
        {(inputType === "text" || inputType === "number") && (
          <Form.Control
            {...register("value", inputOptions)}
            autoFocus
            size="sm"
            type="text"
            inputMode={inputType === "number" ? "numeric" : undefined}
            isInvalid={!!errors.value || !!mutationError}
          />
        )}
        {inputType === "textarea" && (
          <Form.Control
            {...register("value", inputOptions)}
            autoFocus
            size="sm"
            as="textarea"
            isInvalid={!!errors.value || !!mutationError}
          />
        )}
        {inputType === "select" && (selectOptions || !!selectOptionsError) && (
          <Form.Select
            {...register("value", inputOptions)}
            autoFocus
            size="sm"
            disabled={!selectOptions}
            isInvalid={
              !!errors.value || !!mutationError || !!selectOptionsError
            }
          >
            <option value="">Select...</option>
            {selectOptions?.map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        )}
        {inputType === "yes_no" && (
          <Form.Select
            {...register("value", inputOptions)}
            autoFocus
            size="sm"
            isInvalid={!!errors.value || !!mutationError}
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Form.Select>
        )}

        {(errors.value || mutationError || !!selectOptionsError) && (
          <Form.Control.Feedback type="invalid">
            {/* react-hook-form validation error message */}
            {errors.value && errors.value.message}
            {/* Lookup option error message */}
            {!errors.value &&
              !!selectOptionsError &&
              "Failed to retrieve menu options"}
            {/* Mutation error message */}
            {!errors.value && !selectOptionsError && mutationError}
          </Form.Control.Feedback>
        )}
      </div>
      <div className="text-end text-nowrap">
        <span className="me-2">
          <Button size="sm" type="submit" disabled={isMutating || !isDirty}>
            Save
          </Button>
        </span>
        <span>
          <Button
            size="sm"
            onClick={onCancel}
            disabled={isMutating}
            variant="secondary"
          >
            Cancel
          </Button>
        </span>
      </div>
    </Form>
  );
}
