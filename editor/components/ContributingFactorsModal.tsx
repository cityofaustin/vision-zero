import { useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useQuery, useMutation } from "@/utils/graphql";
import { Unit } from "@/types/unit";
import { LookupTableOption } from "@/types/relationships";
import { GET_CONTRIB_FACTORS } from "@/queries/contribFactors";
import { UPDATE_UNIT } from "@/queries/unit";
import { useForm, SubmitHandler } from "react-hook-form";

interface ContributingFactorsModalProps {
  show: boolean;
  onClose: () => void;
  unit: Unit;
  onSaveCallback: () => Promise<void>;
}

type ContributingFactorsInputs = {
  contrib_factr_1_id: number | null;
  contrib_factr_2_id: number | null;
  contrib_factr_3_id: number | null;
  contrib_factr_p1_id: number | null;
  contrib_factr_p2_id: number | null;
};

const contribFactors: Array<{
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

export default function ContributingFactorsModal({
  show,
  onClose,
  unit,
  onSaveCallback,
}: ContributingFactorsModalProps) {
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
    formState: { isDirty },
  } = useForm({
    values: defaultValues,
  });

  const { mutate } = useMutation(UPDATE_UNIT);

  /**
   * Submits mutation to database on save button click
   */
  const onSave: SubmitHandler<ContributingFactorsInputs> = async (data) => {
    console.log(data, "this is data");
    await mutate({
      id: unit.id,
      updates: data,
    });
    await onSaveCallback();
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>Edit contributing factors</Modal.Header>
      <Modal.Body>
        <Form id="contribFactorsForm" onSubmit={handleSubmit(onSave)}>
          {contribFactors.map((factor) => {
            return (
              <Form.Group key={factor.path}>
                <Form.Label>{factor.label}</Form.Label>
                {!isLoading && factorOptions && (
                  <Form.Select
                    {...register(factor.path, {
                      // coerce to number or null
                      setValueAs: (v) => Number(v) || null,
                    })}
                  >
                    <option value="">Select...</option>
                    {factorOptions.map((factorOption) => (
                      <option
                        key={factorOption.id}
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
          // disabled={isSubmitting}
          // onClick={handleSubmit(onSubmit)}
          form="contribFactorsForm"
          type="submit"
        >
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={onClose}
          // disabled={isDeleting}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
