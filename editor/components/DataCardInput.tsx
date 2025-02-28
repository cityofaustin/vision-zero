import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { InputType } from "@/types/types";
import { LookupTableOption } from "@/types/relationships";

interface DataCardInputProps {
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
}

/**
 * Component that manages the form UI for a single
 * editable field
 */
const DataCardInput = ({
  initialValue,
  inputType,
  isMutating,
  selectOptions,
  onSave,
  onCancel,
}: DataCardInputProps) => {
  // todo: input validation; input type = number
  const [editValue, setEditValue] = useState<string>(initialValue);

  const isDirty = editValue !== initialValue;

  return (
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(editValue);
      }}
    >
      <div className="mb-2">
        {(inputType === "text" || inputType === "number") && (
          <Form.Control
            autoFocus
            size="sm"
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            inputMode={inputType === "number" ? "numeric" : undefined}
          />
        )}
        {inputType === "textarea" && (
          <Form.Control
            autoFocus
            size="sm"
            as="textarea"
            rows={5}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        )}
        {inputType === "select" && selectOptions && (
          <Form.Select
            autoFocus
            size="sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          >
            <option>Select...</option>
            {selectOptions.map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        )}
        {inputType === "yes_no" && (
          <Form.Select
            autoFocus
            size="sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          >
            <option>Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Form.Select>
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
};

export default DataCardInput;
