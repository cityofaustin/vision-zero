import { Crash } from "@/types/crashes";
import { LookupTableOption } from "./relationships";
import { Unit } from "@/types/unit";
import { EMSPatientCareRecord } from "@/types/ems";

export type PeopleListRow = {
  crash_pk: number;
  crash_timestamp: string;
  drvr_city_name: string;
  drvr_ethncty: LookupTableOption;
  prsn_ethnicity_id: number;
  drvr_zip: string;
  gndr: LookupTableOption;
  prsn_gndr_id: number;
  id: number;
  injry_sev?: LookupTableOption;
  prsn_injry_sev_id: number;
  is_primary_person: boolean;
  prsn_age: number;
  prsn_exp_homelessness: boolean;
  prsn_first_name: string | null;
  prsn_last_name: string | null;
  prsn_mid_name: string | null;
  prsn_nbr?: number | null;
  prsn_taken_to?: string | null;
  prsn_type: LookupTableOption;
  prsn_type_id: number;
  unit_nbr: number;
  unit_id: number;
  unit?: Unit;
  crash?: Crash;
  // we are using Omit to avoid a circular reference
  ems_pcr?: Omit<EMSPatientCareRecord, "person">;
  occpnt_pos: LookupTableOption;
  prsn_occpnt_pos_id: number;
};
