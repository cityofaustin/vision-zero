import { gql } from "apollo-boost";

export const GET_LOOKUPS = gql`
  {
    atd_txdot__city_lkp {
      city_id
      city_desc
    }
    atd_txdot__collsn_lkp {
      collsn_id
      collsn_desc
    }
    atd_txdot__light_cond_lkp {
      light_cond_id
      light_cond_desc
    }
    atd_txdot__injry_sev_lkp {
      injry_sev_id
      injry_sev_desc
    }
    atd_txdot__intrsct_relat_lkp {
      intrsct_relat_id
      intrsct_relat_desc
    }
    atd_txdot__obj_struck_lkp {
      obj_struck_desc
      obj_struck_id
    }
    atd_txdot__road_part_lkp {
      road_part_id
      road_part_desc
    }
    atd_txdot__road_type_lkp {
      road_type_id
      road_type_desc
    }
    atd_txdot__rwy_sys_lkp {
      rwy_sys_id
      rwy_sys_desc
    }
    atd_txdot__traffic_cntl_lkp {
      traffic_cntl_id
      traffic_cntl_desc
    }
    atd_txdot__wthr_cond_lkp {
      wthr_cond_id
      wthr_cond_desc
    }
    atd_txdot__y_n_lkp {
      y_n_id
      y_n_desc
    }
    atd_txdot__asmp_level_lkp {
      asmp_level_id
      asmp_level_desc
    }
  }
`;

export const GET_UNIT_LOOKUPS = gql`
  {
    atd_txdot__trvl_dir_lkp {
      trvl_dir_id
      trvl_dir_desc
    }
    atd_txdot__movt_lkp {
      movement_id
      movement_desc
    }
  }
`;

export const GET_PERSON_LOOKUPS = gql`
  {
    atd_txdot__injry_sev_lkp {
      injry_sev_id
      injry_sev_desc
    }
    atd_txdot__ethnicity_lkp {
      ethnicity_id
      ethnicity_desc
    }
    atd_txdot__gndr_lkp {
      gndr_id
      gndr_desc
    }
  }
`;
