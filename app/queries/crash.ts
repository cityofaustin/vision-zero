import { gql } from "graphql-request";

// export const CRASHES_LIST_VIEW_QUERY = gql`
//   query {
//     crashes_list_view(limit: 100) {
//       id
//       cris_crash_id
//       address_primary
//       record_locator
//     }
//   }
// `;

export const GET_CRASH = gql`
  query CrashDetails($recordLocator: String!) {
    crashes(
      where: {
        _and: {
          record_locator: { _eq: $recordLocator }
          is_deleted: { _eq: false }
        }
      }
    ) {
      id
      record_locator
      updated_at
      updated_by
      case_id
      crash_timestamp
      fhe_collsn_id
      collsn {
        id
        label
      }
      rpt_city_id
      light_cond_id
      wthr_cond_id
      obj_struck {
        id
        label
      }
      obj_struck_id
      crash_speed_limit
      traffic_cntl_id
      address_primary
      rpt_block_num
      rpt_street_name
      rpt_street_desc
      rpt_road_part_id
      rpt_rdwy_sys_id
      rpt_hwy_num
      rpt_street_pfx
      rpt_street_name
      rpt_street_sfx
      address_secondary
      rpt_sec_block_num
      rpt_sec_street_name
      rpt_sec_street_desc
      rpt_sec_road_part_id
      rpt_sec_rdwy_sys_id
      rpt_sec_hwy_num
      rpt_sec_street_pfx
      rpt_sec_street_sfx
      active_school_zone_fl
      at_intrsct_fl
      onsys_fl
      private_dr_fl
      road_constr_zone_fl
      rr_relat_fl
      schl_bus_fl
      toll_road_fl
      law_enforcement_ytd_fatality_num
      investigator_narrative
      cr3_stored_fl
      latitude
      longitude
      location_id
      is_temp_record
      in_austin_full_purpose
      crash_injury_metrics_view {
        vz_fatality_count
        sus_serious_injry_count
        years_of_life_lost
        est_comp_cost_crash_based
        est_total_person_comp_cost
        crash_injry_sev_id
        nonincap_injry_count
        sus_serious_injry_count
        cris_fatality_count
        law_enf_fatality_count
      }
      units(order_by: { unit_nbr: asc }) {
        id
        unit_nbr
        veh_mod_year
        unit_desc_id
        unit_desc {
          id
          label
        }
        veh_body_styl_id
        veh_body_styl {
          id
          label
        }
        veh_make_id
        veh_make {
          id
          label
        }
        veh_mod_id
        veh_mod {
          id
          label
        }
        veh_trvl_dir_id
        trvl_dir {
          id
          label
        }
        movement_id
        movt {
          id
          label
        }
        contrib_factr_1_id
        contrib_factr {
          id
          label
        }
        unit_injury_metrics_view {
          vz_fatality_count
          sus_serious_injry_count
        }
      }
      people_list_view {
        crash_pk
        id
        unit_nbr
        is_primary_person
        prsn_age
        drvr_city_name
        drvr_zip
        prsn_exp_homelessness
        prsn_first_name
        prsn_mid_name
        prsn_last_name
        injry_sev {
          id
          label
        }
        prsn_type {
          id
          label
        }
        gndr {
          id
          label
        }
        drvr_ethncty {
          id
          label
        }
      }
      charges_cris {
        unit_nbr
        prsn_nbr
        citation_nbr
        charge
      }
      crashes_list_view {
        crash_day_of_week
        is_manual_geocode
      }
      change_logs(order_by: { created_at: desc }) {
        id
        crash_pk
        created_at
        created_by
        operation_type
        record_id
        record_type
        record_json
      }
      recommendation {
        id
        created_at
        rec_text
        created_by
        crash_pk
        rec_update
        atd__recommendation_status_lkp {
          rec_status_desc
        }
        recommendations_partners {
          id
          partner_id
          recommendation_id
          atd__coordination_partners_lkp {
            id
            coord_partner_desc
          }
        }
      }
      crash_notes(
        where: { is_deleted: { _eq: false } }
        order_by: { date: desc }
      ) {
        id
        created_at
        updated_at
        date
        text
        user_email
        crash_pk
      }
    }
  }
`;

export const UPDATE_CRASH = gql`
  mutation update_crashes($id: Int!, $updates: crashes_set_input) {
    update_crashes(where: { id: { _eq: $id } }, _set: $updates) {
      affected_rows
      returning {
        cris_crash_id
      }
    }
  }
`;
