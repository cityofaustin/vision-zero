import { Modal, Button, Form, Row } from "react-bootstrap";
import { useQuery } from "@/utils/graphql";
import { LookupTableOption } from "@/types/relationships";
import { GET_CONTRIB_FACTORS } from "@/queries/contribFactors";

interface ContributingFactorsModalProps {
  show: boolean;
  onClose: () => void;
}

const contribFactors = [
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
}: ContributingFactorsModalProps) {
  const { data: factorOptions, isLoading } = useQuery<LookupTableOption>({
    query: GET_CONTRIB_FACTORS,
    typename: "lookups_contrib_factr",
  });

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>Edit contributing factors</Modal.Header>
      <Modal.Body>
        <Form>
          {contribFactors.map((factor) => {
            return (
              <Form.Group key={factor.path}>
                <Form.Label>{factor.label}</Form.Label>
                {!isLoading && factorOptions && (
                  <Form.Select>
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
          size="sm"
          // disabled={isSubmitting}
          // onClick={handleSubmit(onSubmit)}
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
