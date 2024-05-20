import { gql } from "apollo-boost";

export const GET_UNITS = gql`
  query FindUnits($crashId: Int!) {
    units(where: { crash_id: { _eq: $crashId } }) {
      id
      unit_nbr
      veh_mod_year
      unit_desc_lkp {
        label
      }
      veh_body_styl_lkp {
        label
      }
      veh_make_lkp {
        label
      }
      veh_mod_lkp {
        label
      }
      trvl_dir_lkp {
        label
      }
      movt_lkp {
        label
      }
      contrib_factr_lkp {
        label
      }
      unit_injury_metrics_view {
        vz_fatality_count
        sus_serious_injry_count
      }
    }
  }
`;

export const UPDATE_UNIT = gql`
  mutation UpdateUnits($unitId: Int!, $changes: units_edits_set_input) {
    update_units_edits_by_pk(pk_columns: { id: $unitId }, _set: $changes) {
      id
    }
  }
`;
