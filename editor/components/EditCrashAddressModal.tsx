import { Dispatch, SetStateAction, useMemo } from "react";
import { Col, Form, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { SubmitHandler, useForm } from "react-hook-form";
import CrashSwapAddressButton from "@/components/CrashSwapAddressButton";
import { crashesColumns } from "@/configs/crashesColumns";
import { UPDATE_CRASH } from "@/queries/crash";
import { Crash } from "@/types/crashes";
import { useMutation } from "@/utils/graphql";
import AddressFormField from "@/components/AddressFormField";

interface EditCrashAddressModalProps {
  /**
   * A callback fired when either the modal backdrop is clicked, or the
   * escape key is pressed
   */
  setShowEditAddressModal: Dispatch<SetStateAction<boolean>>;
  /**
   * The crash ID
   */
  crashId: number;
  /**
   *  Callback fired after the user form is successfully submitted
   */
  onSaveCallback: () => void;
  /**
   * If the modal should be visible or hidden
   */
  show: boolean;
  /**
   * The crash record
   */
  crash: Crash;
}

export type AddressFormInputs = {
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
};

const primaryColumns = [
  crashesColumns.rpt_block_num,
  crashesColumns.rpt_street_pfx,
  crashesColumns.rpt_street_name,
  crashesColumns.rpt_street_sfx,
  crashesColumns.rpt_hwy_num,
  crashesColumns.rpt_street_desc,
  crashesColumns.rpt_road_part_id,
  crashesColumns.rpt_rdwy_sys_id,
];
const secondaryColumns = [
  crashesColumns.rpt_sec_block_num,
  crashesColumns.rpt_sec_street_pfx,
  crashesColumns.rpt_sec_street_name,
  crashesColumns.rpt_sec_street_sfx,
  crashesColumns.rpt_sec_hwy_num,
  crashesColumns.rpt_sec_street_desc,
  crashesColumns.rpt_sec_road_part_id,
  crashesColumns.rpt_sec_rdwy_sys_id,
];

/**
 * Modal form component used for editing the crash address fields
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

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<AddressFormInputs>({
    defaultValues: defaultValues,
  });

  const { mutate } = useMutation(UPDATE_CRASH);

  /**
   * Submits mutation to database on save button click
   */
  const onSave: SubmitHandler<AddressFormInputs> = async (data) => {
    reset(data);
    await mutate({
      id: crashId,
      updates: data,
    });

    onSaveCallback();
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
      <Modal.Header className="d-flex justify-content-between">
        <Modal.Title>Edit crash address</Modal.Title>
        <CrashSwapAddressButton getValues={getValues} setValue={setValue} />
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSave)} id="addressForm">
          <Row>
            <Col className="">
              <div className="fs-5 mb-2">Primary address</div>
              {primaryColumns.map((col) => {
                return (
                  <Form.Group className="mb-3" key={String(col.path)}>
                    <Form.Label>{col.label}</Form.Label>
                    <AddressFormField col={col} register={register} />
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
                    <AddressFormField col={col} register={register} />
                  </Form.Group>
                );
              })}
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          type="submit"
          form="addressForm"
          disabled={!isDirty}
        >
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
