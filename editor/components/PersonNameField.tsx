import { useCallback } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import { PeopleListRow } from "@/types/peopleList";
import { useMutation } from "@/utils/graphql";

interface PersonNameFieldProps {
  /**
   * Record corresponding to row being edited
   */
  record: PeopleListRow;
  /**
   * Name of record mutation
   */
  mutation: string;
  /**
   * The function to call on cancel button click, which is expected
   * to set the parent component's edit state
   */
  onCancel: () => void;
  /**
   * Function that is an async wrapper around data refetch
   */
  onSaveCallback: () => Promise<void>;
}

type PersonNameFormInputs = {
  prsn_first_name: string | null;
  prsn_mid_name: string | null;
  prsn_last_name: string | null;
};

/**
 * Component that manages the form UI for editing a Person's name, first, middle and last
 */
export default function PersonNameField({
  record,
  onSaveCallback,
  onCancel,
  mutation,
}: PersonNameFieldProps) {
  const { mutate, loading: isMutating } = useMutation(mutation);

  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<PersonNameFormInputs>({
    defaultValues: {
      prsn_first_name: record.prsn_first_name,
      prsn_mid_name: record.prsn_mid_name,
      prsn_last_name: record.prsn_last_name,
    },
  });

  const onSave = useCallback(
    async (data: PersonNameFormInputs) => {
      await mutate({
        id: record.id,
        updates: {
          prsn_first_name: data.prsn_first_name,
          prsn_mid_name: data.prsn_mid_name,
          prsn_last_name: data.prsn_last_name,
        },
      });
      await onSaveCallback();
      // onCancel resets the current edit column to null
      onCancel();
    },
    [mutate, onSaveCallback, onCancel, record]
  );

  return (
    <Form id="personNameForm" onSubmit={handleSubmit(onSave)}>
      <div className="mb-2">
        <Form.Group>
          <Form.Control
            {...register("prsn_first_name", {
              // coerce empty fields to null
              setValueAs: (v) => v?.trim() || null,
            })}
            autoComplete="off"
            data-1p-ignore
            size="sm"
            as="input"
            placeholder="First"
          />
          <Form.Control
            {...register("prsn_mid_name", {
              // coerce empty fields to null
              setValueAs: (v) => v?.trim() || null,
            })}
            autoComplete="off"
            data-1p-ignore
            size="sm"
            as="input"
            placeholder="Middle"
          />
          <Form.Control
            {...register("prsn_last_name", {
              // coerce empty fields to null
              setValueAs: (v) => v?.trim() || null,
            })}
            autoComplete="off"
            data-1p-ignore
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
              reset();
              onCancel();
            }}
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
