import Modal from "react-bootstrap/Modal";
import { Form, Col, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { LookupTableOption } from "@/types/relationships";
import { UPDATE_CRASH } from "@/queries/crash";
import { useMutation } from "@/utils/graphql";
import { crashDataCards } from "@/configs/crashDataCard";
import { useLookupQuery, useQuery } from "@/utils/graphql";
import { Crash } from "@/types/crashes";
import { useMemo, Dispatch, SetStateAction } from "react";
import CrashSwapAddressButton from "@/components/CrashSwapAddressButton";

// import Button from "react-bootstrap/Button";

interface EditCrashAddressModalProps {
  /**
   * A callback fired when either the modal backdrop is clicked, or the
   * escape key is pressed
   */
  setShowEditAddressModal: Dispatch<SetStateAction<boolean>>;
  crashId: number;
  /**
   *  Callback fired after the user form is successfully submitted
   */
  onSaveCallback: () => void;
  /**
  //  * If the modal should be visible or hidden
  //  */
  show: boolean;
  crash: Crash;
}

type AddressInputs = {
  rpt_block_num: string | null;
  rpt_street_pfx: string | null;
  rpt_street_name: string | null;
  rpt_street_sfx: string | null;
  rpt_street_desc: string | null;
  rpt_road_part_id: number | null;
  rpt_rdwy_sys_id: number | null;
  rpt_hwy_num: string | null;
  rpt_sec_block_num: string | null;
  rpt_sec_street_pfx: string | null;
  rpt_sec_street_name: string | null;
  rpt_sec_street_sfx: string | null;
  rpt_sec_street_desc: string | null;
  rpt_sec_road_part_id: number | null;
  rpt_sec_rdwy_sys_id: number | null;
  rpt_sec_hwy_num: string | null;
  updated_by: string;
};

/**
 * Modal form component used for creating or editing a user
 */
export default function EditCrashAddressModal({
  setShowEditAddressModal,
  crashId,
  onSaveCallback,
  show,
  crash,
}: EditCrashAddressModalProps) {
  const defaultValues = useMemo(() => {
    return (
      crash && {
        rpt_block_num: crash.rpt_block_num,
        rpt_street_pfx: crash.rpt_street_pfx,
        rpt_street_name: crash.rpt_street_name,
        rpt_street_sfx: crash.rpt_street_sfx,
        rpt_street_desc: crash.rpt_street_desc,
        rpt_road_part_id: crash.rpt_road_part_id,
        rpt_rdwy_sys_id: crash.rpt_rdwy_sys_id,
        rpt_hwy_num: crash.rpt_hwy_num,
        rpt_sec_block_num: crash.rpt_sec_block_num,
        rpt_sec_street_pfx: crash.rpt_sec_street_pfx,
        rpt_sec_street_name: crash.rpt_sec_street_name,
        rpt_sec_street_sfx: crash.rpt_sec_street_sfx,
        rpt_sec_street_desc: crash.rpt_sec_street_desc,
        rpt_sec_road_part_id: crash.rpt_sec_road_part_id,
        rpt_sec_rdwy_sys_id: crash.rpt_sec_rdwy_sys_id,
        rpt_sec_hwy_num: crash.rpt_sec_hwy_num,
      }
    );
  }, [crash]);

  const { register, handleSubmit, reset } = useForm<AddressInputs>({
    defaultValues: defaultValues,
  });

  const { mutate } = useMutation(UPDATE_CRASH);

  const columns = crashDataCards.address;
  const secondaryColumns = crashDataCards.address_secondary;

  const onSubmit: SubmitHandler<AddressInputs> = async (data) => {
    await mutate({
      id: crashId,
      updates: data,
    });

    onSaveCallback();
  };

  const FormField = ({ col }) => {
    const [query, typename] = useLookupQuery(
      col?.relationship ? col.relationship : undefined
    );

    const { data: selectOptions, error: selectOptionsError } =
      useQuery<LookupTableOption>({
        query,
        // we don't need to refetch lookup table options
        options: { revalidateIfStale: false },
        typename,
      });
    const inputType = col.inputType;
    return (
      <div className="mb-2">
        {(inputType === "text" || inputType === "number") && (
          <Form.Control
            {...register(col.path)}
            size="sm"
            type="text"
            inputMode={inputType === "number" ? "numeric" : undefined}
          />
        )}
        {inputType === "select" && (selectOptions || !!selectOptionsError) && (
          <Form.Select
            {...register(col.path)}
            size="sm"
            disabled={!selectOptions}
          >
            <option value="">Select...</option>
            {selectOptions?.map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        )}
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        reset();
        setShowEditAddressModal(false);
      }}
      size="lg"
    >
      <Modal.Header>
        <Modal.Title className="me-2">Edit crash address</Modal.Title>
        <CrashSwapAddressButton />
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)} id="addressForm">
          <Row>
            <Col className="">
              <div className="fs-5 mb-2">Primary address</div>
              {columns.map((col) => {
                return (
                  <Form.Group className="mb-3" key={String(col.path)}>
                    <Form.Label>{col.label}</Form.Label>
                    <FormField col={col}></FormField>
                  </Form.Group>
                );
              })}
            </Col>
            <Col>
              <div className="fs-5 mb-2">Secondary address</div>
              {secondaryColumns.map((col) => {
                return (
                  <Form.Group className="mb-3" key={String(col.path)}>
                    <Form.Label>{col.label}</Form.Label>
                    <FormField col={col}></FormField>
                  </Form.Group>
                );
              })}
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" form="addressForm">
          <span>Save</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            setShowEditAddressModal(false);
          }}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
