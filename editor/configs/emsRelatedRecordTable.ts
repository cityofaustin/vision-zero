import { ALL_EMS_COLUMNS } from "./emsColumns";
import { EMSPatientCareRecord } from "@/types/ems";
import { ColDataCardDef } from "@/types/types";

export const emsRelatedRecordCols = [
  ALL_EMS_COLUMNS.unit_nbr,
  ALL_EMS_COLUMNS.prsn_nbr,
  ALL_EMS_COLUMNS.patient_injry_sev,
  ALL_EMS_COLUMNS.patient_injry_sev_reason,
  ALL_EMS_COLUMNS.pcr_patient_age,
  ALL_EMS_COLUMNS.pcr_patient_race,
  ALL_EMS_COLUMNS.pcr_patient_gender,
  ALL_EMS_COLUMNS.travel_mode,
  ALL_EMS_COLUMNS.mvc_form_position_in_vehicle,
  ALL_EMS_COLUMNS.incident_number,
  ALL_EMS_COLUMNS.crash_match_status,
];

/**
 * Custom mutation variable handler which adds the `_match_event_name` prop
 * to the record update payload
 */
export const getMutationVariables = (
  _record: EMSPatientCareRecord,
  column: ColDataCardDef<EMSPatientCareRecord>,
  value: unknown,
  defaultVariables: { id: number; updates: Record<string, unknown> }
): Record<string, unknown> => {
  if (column.path !== "person_id") {
    return defaultVariables;
  }
  return {
    id: defaultVariables.id,
    updates: {
      ...defaultVariables.updates,
      _match_event_name: value
        ? "match_person_by_manual_qa"
        : "unmatch_person_by_manual_qa",
    },
  };
};
