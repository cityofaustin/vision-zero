import { ALL_EMS_COLUMNS as columns } from "@/configs/emsColumns";

export const emsDataCards = {
  summary: [
    columns.incident_number,
    columns.incident_received_datetime_with_timestamp,
    columns.incident_problem,
    columns.apd_incident_numbers,
  ],
  patient: [
    columns.patient_injry_sev,
    columns.patient_injry_sev_reason,
    columns.pcr_patient_age,
    columns.pcr_patient_race,
    columns.pcr_patient_gender,
    columns.travel_mode,
    columns.mvc_form_position_in_vehicle,
    columns.pcr_transport_destination,
    columns.id,
    columns.cris_crash_id,
    columns.person_id,
    columns.crash_match_status,
    columns.person_match_status,
    columns.non_cr3_match_status,
    columns.atd_apd_blueform_case_id,
  ],
};
