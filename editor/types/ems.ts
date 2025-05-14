import { Crash } from "@/types/crashes";
import { LookupTableOption } from "@/types/relationships";

export type EMSPatientCareRecord = {
  apd_incident_numbers: number[] | null;
  crash: Crash | null;
  crash_match_status: string;
  crash_pk: number | null;
  id: number;
  incident_location_address: string | null;
  incident_number: number | null;
  incident_problem: string | null;
  incident_received_datetime: string | null;
  injry_sev: LookupTableOption | null;
  matched_crash_pks: number[] | null;
  mvc_form_position_in_vehicle: string | null;
  patient_injry_sev_id: number | null;
  pcr_patient_age: number | null;
  pcr_patient_gender: string | null;
  pcr_patient_race: string | null;
  pcr_transport_destination?: string | null;
  person_id: number | null;
  travel_mode: string | null;
  unparsed_apd_incident_numbers: string | null;
};
