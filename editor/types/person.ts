import { LookupTableOption } from "./relationships";

export type Person = {
  crash_pk: number;
  drvr_city_name: string;
  drvr_ethncty: LookupTableOption;
  prsn_ethnicity_id: number;
  drvr_zip: string;
  gndr: LookupTableOption;
  prsn_gndr_id: number;
  id: number;
  injry_sev: LookupTableOption;
  prsn_injry_sev_id: number;
  is_primary_person: boolean;
  prsn_age: number;
  prsn_exp_homelessness: boolean;
  prsn_first_name: string | null;
  prsn_last_name: string | null;
  prsn_mid_name: string | null;
  prsn_type: LookupTableOption;
  prsn_type_id: number;
  unit_nbr: number;
  occpnt_pos: LookupTableOption;
  prsn_occpnt_pos_id: number;
};
