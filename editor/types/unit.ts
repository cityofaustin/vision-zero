import { LookupTableOption } from "./relationships";

export type Unit = {
  id: number;
  contrib_factr: LookupTableOption | null;
  contrib_factr_2: LookupTableOption | null;
  contrib_factr_3: LookupTableOption | null;
  contrib_factr_p1: LookupTableOption | null;
  contrib_factr_p2: LookupTableOption | null;
  unit_nbr: number | null;
  veh_body_styl: LookupTableOption | null;
  veh_body_styl_id: number | null;
  veh_make: LookupTableOption | null;
  veh_make_id: number | null;
  veh_mod: LookupTableOption | null;
  veh_mod_id: number | null;
  veh_mod_year: number | null;
  unit_desc: LookupTableOption | null;
  unit_desc_id: number | null;
  trvl_dir: LookupTableOption | null;
  veh_trvl_dir_id: number | null;
  veh_hnr_fl: boolean | null;
  movt: LookupTableOption | null;
  movement_id: number | null;
};
