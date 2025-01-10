import { useCallback } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import { Person } from "@/types/person";
import { useMutation } from "@/utils/graphql";

interface PersonNameFieldProps {
  // dont forget the comments chia
  record: Person;
  mutation: string;
  /**
   * The function to call on cancel button click, which is expected
   * to set control the parent component's edit state
   */
  onCancel: () => void;
  isEditingThisColumn: boolean;
}

type PersonNameFormInputs = {
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
};

/**
 * Component that manages the form UI for multiple input fields
 */
const PersonNameField = ({
  record,
  // onSave,
  onCancel,
  mutation,
  isEditingThisColumn,
}: PersonNameFieldProps) => {
  const { mutate, loading: isMutating } = useMutation(mutation);

  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<PersonNameFormInputs>({
    defaultValues: {
      first_name: record.prsn_first_name,
      middle_name: record.prsn_mid_name,
      last_name: record.prsn_last_name,
    },
  });

  const onSave = useCallback(
    async (data: PersonNameFormInputs) => {
      console.log(data);
      // this is where i fix the payload
      // do i need the record.crash_pk here?
      // await mutate(variables, { skip_updated_by_setter: true });
      // await onSaveCallback();
      onCancel(); // closes edit, should I rename this
    },
    [] // how come im not seeing any warnings for missing stuff?
  );

  if (!isEditingThisColumn) {
    // filter out null fields then join into a string
    const nameFields = [
      record.prsn_first_name,
      record.prsn_mid_name,
      record.prsn_last_name,
    ];
    const displayName = nameFields.filter((n) => n).join(" ");
    return displayName;
  } else {
    return (
      <Form id="personNameForm" onSubmit={handleSubmit(onSave)}>
        <div className="mb-2">
          <Form.Group>
          {/* <Form.Label>First</Form.Label> */}
            <Form.Control
              {...register("first_name", {
                // coerce empty fields to null
                setValueAs: (v) => v?.trim() || null,
              })}
              size="sm"
              as="input"
              placeholder="First" 
            />
            <Form.Control
              {...register("middle_name", {
                // coerce empty fields to null
                setValueAs: (v) => v?.trim() || null,
              })}
              size="sm"
              as="input"
              placeholder="Middle" 
            />
            <Form.Control
              {...register("last_name", {
                // coerce empty fields to null
                setValueAs: (v) => v?.trim() || null,
              })}
              size="sm"
              as="input"
              placeholder="Last" 
            />
          </Form.Group>
        </div>

        <div className="text-end">
          <span className="me-2">
            <Button
              size="sm"
              type="submit"
              disabled={isMutating || !isDirty}
              form="personNameForm"
            >
              Save
            </Button>
          </span>
          <span>
            <Button
              size="sm"
              onClick={() => {
                onCancel();
                reset();
              }}
              disabled={isMutating}
              variant="danger"
            >
              Cancel
            </Button>
          </span>
        </div>
      </Form>
    );
  }
};

export default PersonNameField;
