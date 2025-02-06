import { useForm } from "react-hook-form";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { InputType } from "@/types/types";
import { LookupTableOption } from "@/types/relationships";

// TODO: 
// - use EditableField component with DataCardInput component in addition to
// RelatedRecordTableRow component
// - make sure fields that are nullable don't break from new validation rules
// - make sure this aligns with React Hook Form patterns 

interface ValidationRules {
  required?: boolean;
  pattern?: RegExp;
  custom?: (value: string) => boolean | string;
}

interface EditableFieldProps {
  /**
   * The initial value to populate the input
   */
  initialValue: string;
  /**
   * If the input is in the process of mutating via API call
   */
  isMutating: boolean;
  /**
   * Controls the type of input to be rendered
   */
  inputType?: InputType;
  /**
   * Array of lookup table options that will populate a <select> input
   */
  selectOptions?: LookupTableOption[];
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
  validation?: ValidationRules;
}

interface FormValues {
  value: string;
}

/**
 * Component that manages the form UI for a single
 * editable field
 */
const EditableField = ({
  initialValue,
  inputType,
  isMutating,
  selectOptions,
  onSave,
  onCancel,
  validation,
}: EditableFieldProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      value: initialValue,
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    await onSave(data.value);
  };

  // Build validation rules
  const validationRules: Record<string, unknown> = {};
  if (validation?.required) {
    validationRules.required = "This field is required";
  }
  if (inputType === "number") {
    validationRules.pattern = {
      value: /^\d*\.?\d*$/,
      message: "Please enter a valid number",
    };
  }
  if (validation?.pattern) {
    validationRules.pattern = {
      value: validation.pattern,
      message: "Invalid format",
    };
  }
  if (validation?.custom) {
    validationRules.validate = validation.custom;
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-2">
        {(inputType === "text" || inputType === "number") && (
          <Form.Control
            {...register("value", validationRules)}
            autoFocus
            size="sm"
            type="text"
            inputMode={inputType === "number" ? "numeric" : undefined}
            isInvalid={!!errors.value}
          />
        )}
        {inputType === "textarea" && (
          <Form.Control
            {...register("value", validationRules)}
            autoFocus
            size="sm"
            as="textarea"
            isInvalid={!!errors.value}
          />
        )}
        {inputType === "select" && selectOptions && (
          <Form.Select
            {...register("value", validationRules)}
            autoFocus
            size="sm"
            isInvalid={!!errors.value}
          >
            <option value="">Select...</option>
            {selectOptions.map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        )}
        {inputType === "yes_no" && (
          <Form.Select
            {...register("value", validationRules)}
            autoFocus
            size="sm"
            isInvalid={!!errors.value}
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Form.Select>
        )}
        {errors.value && (
          <Form.Control.Feedback type="invalid">
            {errors.value.message}
          </Form.Control.Feedback>
        )}
      </div>
      <div className="text-end">
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
            variant="danger"
          >
            Cancel
          </Button>
        </span>
      </div>
    </Form>
  );
};

export default EditableField;
