import { gql } from "apollo-boost";

export const GET_UNITS = gql`
  query FindUnits($crashId: Int!) {
    units(where: { crash_id: { _eq: $crashId } }) {
      id
      unit_nbr
      veh_mod_year
      unit_desc_lkp {
        id
        label
      }
      veh_body_styl_lkp {
        id
        label
      }
      veh_make_lkp {
        id
        label
      }
      veh_mod_lkp {
        id
        label
      }
      trvl_dir_lkp {
        id
        label
      }
      movt_lkp {
        id
        label
      }
      contrib_factr_lkp {
        id
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
