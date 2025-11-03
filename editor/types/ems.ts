import { Crash } from "@/types/crashes";
import { PeopleListRow } from "@/types/peopleList";
import { LookupTableOption } from "@/types/relationships";

export type EMSPatientCareRecord = {
  apd_incident_numbers: number[] | null;
  crash: Crash | null;
  crash_match_status: string;
  non_cr3_match_status: string;
  atd_apd_blueform_case_id: number | null;
  matched_non_cr3_case_ids: number[] | null;
  crash_pk: number | null;
  id: number;
  incident_location_address: string | null;
  incident_number: number | null;
  incident_problem: string | null;
  incident_received_datetime: string | null;
  latitude: number | null;
  longitude: number | null;
  patient_injry_sev: LookupTableOption | null;
  patient_injry_sev_reason?: string | null;
  matched_crash_pks: number[] | null;
  mvc_form_position_in_vehicle: string | null;
  patient_injry_sev_id: number | null;
  pcr_patient_age: number | null;
  pcr_patient_gender: string | null;
  pcr_patient_race: string | null;
  pcr_transport_destination?: string | null;
  person_id: number | null;
  // we are using Omit to avoid a circular reference
  person?: Omit<PeopleListRow, "ems_pcr"> | null;
  person_match_status?: string | null;
  person_match_attributes?: string[] | null;
  travel_mode: string | null;
  unparsed_apd_incident_numbers: string | null;
  is_deleted: boolean;
};
