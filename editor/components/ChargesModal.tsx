import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Unit } from "@/types/unit";
import { Charge } from "@/types/charge";
import { INSERT_CHARGE } from "@/queries/charges";
import { useMutation } from "@/utils/graphql";
import { SubmitHandler } from "react-hook-form";
import { useAuth0 } from "@auth0/auth0-react";

interface ChargesModalProps {
  crashPk: number;
  show: boolean;
  unitCharges: Charge[] | undefined;
  setShowChargesModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSaveCallback: () => Promise<void>;
  unit: Unit;
}

type ChargesFormInputs = {
  charge: string;
};

export default function ChargesModal({
  crashPk,
  unit,
  unitCharges,
  show,
  setShowChargesModal,
  onSaveCallback,
}: ChargesModalProps) {
  const { user } = useAuth0();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChargesFormInputs>({
    // defaultValues: { charge: unitCharges[0].charge || "" },
  });

  const { mutate, loading: isSubmitting } = useMutation(INSERT_CHARGE);

  const onSubmit: SubmitHandler<ChargesFormInputs> = async (data) => {
    const updates = {
      charge: data.charge,
      unit_nbr: unit.unit_nbr,
      prsn_nbr: 1,
      crash_pk: crashPk,
      is_temp: true,
      cris_schema_version: "2026",
      created_by: user?.email,
    };

    const responseData = await mutate({ updates });
    if (!!responseData) {
      onSaveCallback();
    }
    reset();
    onClose();
  };

  const onClose = () => setShowChargesModal(false);

  return (
    <Modal
      show={show}
      onHide={onClose}
      onExited={() => {
        reset();
      }}
    >
      <Form onSubmit={handleSubmit(onSubmit)} id="chargesForm">
        <Modal.Header>
          <Modal.Title>Edit charges</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              as="textarea"
              aria-label="Charges text"
              rows={6}
              placeholder="Enter charges..."
              {...register("charge", {
                // coerce empty fields to null
                setValueAs: (v) => v?.trim() || null,
              })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            // disabled={!isDirty || isSubmitting}
            form="chargesForm"
            type="submit"
            disabled={isSubmitting}
          >
            Save
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
