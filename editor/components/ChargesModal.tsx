import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Unit } from "@/types/unit";
import { Charge } from "@/types/charge";

interface ChargesModalProps {
  show: boolean;
  unitCharges: Charge[] | undefined;
  setShowChargesModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSaveCallback: () => Promise<void>;
  unit: Unit;
}

type ChargesFormInputs = {
  id: number;
  created_by: string;
  updated_by: string;
  charge: string;
  crash_pk: number;
  unit_nbr: number;
  prsn_nbr: number;
};

export default function ChargesModal({
  unit,
  unitCharges,
  show,
  setShowChargesModal,
  onSaveCallback,
}: ChargesModalProps) {
  console.log(unitCharges);
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  // } = useForm<ChargesFormInputs>({
  //   defaultValues: { charge: unitCharges[0].charge || "" },
  // });

  const onClose = () => setShowChargesModal(false);
  return (
    <Modal
      show={show}
      onHide={onClose}
      onExited={() => {
        // reset();
      }}
    >
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
            // isInvalid={Boolean(errors.text)}
            // ref={(e) => {
            //   registerRef(e);
            //   textareaRef.current = e;
            // }}
            // autoFocus
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button
          // disabled={!isDirty || isSubmitting}
          form="contribFactorsForm"
          type="submit"
        >
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            onClose();
          }}
          // disabled={isSubmitting}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
