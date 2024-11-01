import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { LookupTableOption, InputType } from "@/types/types";

const DataCardInput = ({
  initialValue,
  inputType,
  isMutating,
  selectOptions,
  onSave,
  onCancel,
}: {
  initialValue: string;
  isMutating: boolean;
  inputType?: InputType;
  selectOptions?: LookupTableOption[];
  onSave: (value: string) => Promise<void>;
  onCancel: () => void;
}) => {
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

export default DataCardInput;
