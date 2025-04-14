import { ALL_EMS_COLUMNS as columns } from "@/configs/emsColumns";

export const emsDataCards = {
  summary: [
    columns.incident_number,
    columns.incident_received_datetime_with_timestamp,
    columns.incident_problem,
    columns.crash_match_status,
    columns.apd_incident_numbers,
    columns.cris_crash_id,
  ],
  patient: [
    columns.id,
    columns.patient_injry_sev,
    columns.travel_mode,
    columns.mvc_form_position_in_vehicle,
    columns.pcr_patient_age,
    columns.pcr_patient_gender,
    columns.pcr_patient_race,
    columns.cris_crash_id,
    columns.person_id,
  ],
};
