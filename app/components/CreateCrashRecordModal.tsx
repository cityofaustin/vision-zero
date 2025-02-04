import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import AlignedLabel from "@/components/AlignedLabel";
import FormControlDatePicker from "@/components/FormControlDatePicker";
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { useQuery, useMutation } from "@/utils/graphql";
import { UNIT_TYPES_QUERY } from "@/queries/unit";
import { CREATE_CRIS_CRASH } from "@/queries/crash";
import { LookupTableOption } from "@/types/relationships";
import { Crash } from "@/types/crashes";
import { useAuth0 } from "@auth0/auth0-react";

interface CreateCrashModalProps {
  /**
   * A callback fired when either the modal backdrop is clicked, or the
   * escape key is pressed
   */
  onClose: () => void;
  /**
   *  Callback fired after the user form is successfully submitted
   */
  onSubmitCallback: () => void;
  /**
   * If the modal should be visible or hidden
   */
  show: boolean;
}

type UnitInputs = {
  unit_desc_id: string;
  fatality_count: number;
  injury_count: number;
};

type CrashInputs = {
  case_id: string;
  crash_timestamp: string;
  created_by: string;
  cris_schema_version: "2023";
  is_temp_record: boolean;
  private_dr_fl: boolean;
  rpt_city_id: number;
  rpt_sec_street_name: string;
  rpt_street_name: string;
  units_cris: UnitInputs[];
  updated_by: string;
};

const DEFAULT_UNIT: UnitInputs = {
  unit_desc_id: "",
  fatality_count: 0,
  injury_count: 0,
};

const DEFAULT_FORM_VALUES: CrashInputs = {
  case_id: "",
  crash_timestamp: "",
  created_by: "",
  cris_schema_version: "2023",
  is_temp_record: true,
  private_dr_fl: false,
  rpt_city_id: 22,
  rpt_sec_street_name: "",
  rpt_street_name: "",
  units_cris: [{ ...DEFAULT_UNIT }],
  updated_by: "",
};

/**
 * Construct a unit record with people records such
 * that it can be included in a crash insert mutation
 */
const makeUnitRecord = (unit: UnitInputs, index: number, userEmail: string) => {
  const unitNumber = index + 1;

  const unitRecord: Record<string, unknown> = {
    unit_nbr: unitNumber,
    unit_desc_id: unit.unit_desc_id,
    cris_schema_version: "2023",
    updated_by: userEmail,
    created_by: userEmail,
  };

  const people = [];

  // create fatal injuries
  for (let i = 0; i < Number(unit.fatality_count); i++) {
    const personRecord = {
      prsn_nbr: i + 1,
      unit_nbr: unitNumber,
      prsn_injry_sev_id: 4,
      cris_schema_version: "2023",
      is_primary_person: true,
      updated_by: userEmail,
      created_by: userEmail,
    };

    people.push(personRecord);
  }

  // create other injuries
  for (let i = 0; i < Number(unit.injury_count); i++) {
    people.push({
      prsn_nbr: unit.fatality_count + i + 1,
      unit_nbr: unitNumber,
      prsn_injry_sev_id: 1,
      cris_schema_version: "2023",
      is_primary_person: true,
      updated_by: userEmail,
      created_by: userEmail,
    });
  }

  return { ...unitRecord, people_cris: { data: people } };
};

/**
 * Modal form component used for creating a temporary crash record
 */
export default function CreateCrashRecordModal({
  onClose,
  onSubmitCallback,
  show,
}: CreateCrashModalProps) {
  const { user } = useAuth0();
  const { data: unitTypes, isLoading: isLoadingUnitTypes } =
    useQuery<LookupTableOption>({
      query: UNIT_TYPES_QUERY,
      typename: "lookups_unit_desc",
    });
  const { mutate, loading: isSubmitting } = useMutation(CREATE_CRIS_CRASH);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CrashInputs>({
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      created_by: user?.email || "",
      updated_by: user?.email || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units_cris",
  });

  const onSubmit: SubmitHandler<CrashInputs> = async (data) => {
    const crash: Record<string, unknown> = data;
    crash.units_cris = {
      data: data.units_cris.map((unit, i) =>
        makeUnitRecord(unit, i, user?.email || "")
      ),
    };

    const responseData = await mutate<{
      insert_crashes_cris: { returning: Crash[] };
    }>({ crash });

    if (responseData && responseData.insert_crashes_cris) {
      onSubmitCallback();
    }
    reset();
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        reset();
        onClose();
      }}
      animation={false}
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Create crash record</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)} id="userForm">
          {/* Case Id */}
          <Form.Group className="mb-3">
            <Form.Label>Case ID</Form.Label>
            <Form.Control
              {...register("case_id", { required: true })}
              autoComplete="off"
              data-1p-ignore
              placeholder="Case ID"
              isInvalid={Boolean(errors.case_id)}
              autoFocus
            />
            <Form.Control.Feedback>Required</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Case ID is required
            </Form.Control.Feedback>
          </Form.Group>
          {/* Crash date */}
          <Form.Group className="mb-3">
            <Form.Label>Crash date</Form.Label>
            <FormControlDatePicker<CrashInputs>
              name="crash_timestamp"
              control={control}
              isInvalid={Boolean(errors?.crash_timestamp)}
              {...{ rules: { required: true } }}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{
                // manually control date picker feedback
                display: Boolean(errors?.crash_timestamp) ? "block" : "none",
              }}
            >
              Crash date is required
            </Form.Control.Feedback>
          </Form.Group>
          {/* Primary address */}
          <Form.Group className="mb-3">
            <Form.Label>Primary address</Form.Label>
            <Form.Control
              {...register("rpt_street_name", {
                required: true,
                setValueAs: (v) => v?.trim().toUpperCase() || null,
              })}
              autoComplete="off"
              data-1p-ignore
              placeholder="ex: W 4TH ST"
              isInvalid={Boolean(errors.rpt_street_name)}
            />
            <Form.Control.Feedback type="invalid">
              Primary address is required
            </Form.Control.Feedback>
          </Form.Group>
          {/* Secondary address */}
          <Form.Group className="mb-3">
            <Form.Label>Secondary address</Form.Label>
            <Form.Control
              {...register("rpt_sec_street_name", {
                setValueAs: (v) => v?.trim().toUpperCase() || null,
              })}
              autoComplete="off"
              data-1p-ignore
              placeholder="ex: 100 S CONGRESS AVE"
              isInvalid={Boolean(errors.rpt_sec_street_name)}
            />
          </Form.Group>
          {/* Repeatable unit inputs */}
          {fields.map((field, index) => {
            return (
              <Card className="mb-3" key={index}>
                <Card.Header className="d-flex justify-content-between">
                  <span>Unit</span>
                  {fields.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => remove(index)}
                    >
                      <AlignedLabel>
                        <FaCircleMinus className="me-2" />
                        <span>Remove</span>
                      </AlignedLabel>
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Unit type</Form.Label>
                    {unitTypes && (
                      <Form.Select
                        {...register(`units_cris.${index}.unit_desc_id`, {
                          // coerce to number or null
                          required: true,
                          setValueAs: (v) => Number(v) || null,
                        })}
                        isInvalid={Boolean(
                          errors.units_cris?.[index]?.unit_desc_id
                        )}
                      >
                        <option value="">Select...</option>
                        {unitTypes.map((option) => (
                          <option key={option.id} value={String(option.id)}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                    <Form.Control.Feedback type="invalid">
                      Unit type is required
                    </Form.Control.Feedback>
                    {isLoadingUnitTypes && <Spinner size="sm" />}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fatality count</Form.Label>
                    {unitTypes && (
                      <Form.Control
                        {...register(`units_cris.${index}.fatality_count`, {
                          required: "Fatality count is required",
                          min: { value: 0, message: "Cannot be less than 0" },
                          pattern: {
                            value: /^\d+$/,
                            message: "Must be a number",
                          },
                        })}
                        isInvalid={Boolean(
                          errors.units_cris?.[index]?.fatality_count
                        )}
                        inputMode="numeric"
                      />
                    )}
                    <Form.Control.Feedback type="invalid">
                      {errors?.units_cris?.[index]?.fatality_count?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Injury count</Form.Label>
                    {unitTypes && (
                      <Form.Control
                        {...register(`units_cris.${index}.injury_count`, {
                          required: "Injury count is required",
                          min: { value: 0, message: "Cannot be less than 0" },
                          pattern: {
                            value: /^\d+$/,
                            message: "Must be a number",
                          },
                        })}
                        isInvalid={Boolean(
                          errors.units_cris?.[index]?.injury_count
                        )}
                        inputMode="numeric"
                      />
                    )}
                    <Form.Control.Feedback type="invalid">
                      {errors?.units_cris?.[index]?.injury_count?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
            );
          })}
          <div className="text-end">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => append({ ...DEFAULT_UNIT })}
            >
              <AlignedLabel>
                <FaCirclePlus className="me-2" />
                Add unit
              </AlignedLabel>
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          type="submit"
          form="userForm"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner size="sm" />}
          {!isSubmitting && <span>Create crash record</span>}
        </Button>
        {!isSubmitting && (
          <Button
            variant="danger"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
