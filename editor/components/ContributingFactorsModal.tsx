import { useMemo, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useQuery, useMutation } from "@/utils/graphql";
import { Unit } from "@/types/unit";
import { LookupTableOption } from "@/types/relationships";
import { GET_CONTRIB_FACTORS } from "@/queries/unit";
import { UPDATE_UNIT } from "@/queries/unit";
import { useForm, SubmitHandler } from "react-hook-form";
import { stringToNumberNullable } from "@/utils/formHelpers";

interface ContributingFactorsModalProps {
  show: boolean;
  setShowContribFactorsModal: React.Dispatch<React.SetStateAction<boolean>>;
  unit: Unit;
  onSaveCallback: () => Promise<void>;
}

type ContributingFactorsInputs = Pick<
  Unit,
  | "contrib_factr_1_id"
  | "contrib_factr_2_id"
  | "contrib_factr_3_id"
  | "contrib_factr_p1_id"
  | "contrib_factr_p2_id"
>;

const contribFactorLabels: Array<{
  path: keyof ContributingFactorsInputs;
  label: string;
}> = [
  {
    path: "contrib_factr_1_id",
    label: "Primary #1",
  },
  {
    path: "contrib_factr_2_id",
    label: "Primary #2",
  },
  {
    path: "contrib_factr_3_id",
    label: "Primary #3",
  },
  {
    path: "contrib_factr_p1_id",
    label: "Possible #1",
  },
  {
    path: "contrib_factr_p2_id",
    label: "Possible #2",
  },
];

/**
 * A modal for editing the contributing factors of a
 * temporary crash record on the fatalities page
 */
export default function ContributingFactorsModal({
  show,
  setShowContribFactorsModal,
  unit,
  onSaveCallback,
}: ContributingFactorsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: factorOptions, isLoading } = useQuery<LookupTableOption>({
    query: GET_CONTRIB_FACTORS,
    typename: "lookups_contrib_factr",
  });

  const defaultValues = useMemo(() => {
    return {
      contrib_factr_1_id: unit.contrib_factr_1_id,
      contrib_factr_2_id: unit.contrib_factr_2_id,
      contrib_factr_3_id: unit.contrib_factr_3_id,
      contrib_factr_p1_id: unit.contrib_factr_p1_id,
      contrib_factr_p2_id: unit.contrib_factr_p2_id,
    };
  }, [unit]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    values: defaultValues,
  });

  const { mutate } = useMutation(UPDATE_UNIT);

  /**
   * Submits mutation to database on save button click
   */
  const onSave: SubmitHandler<ContributingFactorsInputs> = async (data) => {
    setIsSubmitting(true);
    await mutate({
      id: unit.id,
      updates: data,
    });
    await onSaveCallback();
    onClose();
    setIsSubmitting(false);
  };

  const onClose = () => setShowContribFactorsModal(false);

  return (
    <Modal
      show={show}
      onHide={onClose}
      onExited={() => {
        reset();
      }}
    >
      <Modal.Header>
        <Modal.Title>Edit contributing factors</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form id="contribFactorsForm" onSubmit={handleSubmit(onSave)}>
          {contribFactorLabels.map((factor) => {
            return (
              <Form.Group key={factor.path} className="mb-2">
                <Form.Label>{factor.label}</Form.Label>
                {!isLoading && factorOptions && (
                  <Form.Select
                    {...register(factor.path, {
                      setValueAs: (v) => stringToNumberNullable(v),
                    })}
                  >
                    <option value="">Select...</option>
                    {factorOptions.map((factorOption) => (
                      <option
                        key={factorOption.label}
                        value={String(factorOption.id)}
                      >
                        {factorOption.label}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            );
          })}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={!isDirty || isSubmitting}
          form="contribFactorsForm"
          type="submit"
        >
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            onClose();
            reset();
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
