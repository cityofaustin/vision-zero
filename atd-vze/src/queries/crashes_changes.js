import { gql } from "apollo-boost";


/**
 * A template that is used to gather the original crash record
 * and all records of pending changes.
 * @type {gql}
 */
export const GET_CRASH_CHANGE = gql`
    query FindCrash($crashId: Int) {
        atd_txdot_crashes(where: { crash_id: { _eq: $crashId } }) {
            crash_id
            crash_fatal_fl
            cmv_involv_fl
            schl_bus_fl
            rr_relat_fl
            medical_advisory_fl
            amend_supp_fl
            active_school_zone_fl
            crash_date
            crash_time
            case_id
            local_use
            rpt_cris_cnty_id
            rpt_city_id
            rpt_outside_city_limit_fl
            thousand_damage_fl
            rpt_latitude
            rpt_longitude
            rpt_rdwy_sys_id
            rpt_hwy_num
            rpt_hwy_sfx
            rpt_road_part_id
            rpt_block_num
            rpt_street_pfx
            rpt_street_name
            rpt_street_sfx
            private_dr_fl
            toll_road_fl
            crash_speed_limit
            road_constr_zone_fl
            road_constr_zone_wrkr_fl
            rpt_street_desc
            at_intrsct_fl
            rpt_sec_rdwy_sys_id
            rpt_sec_hwy_num
            rpt_sec_hwy_sfx
            rpt_sec_road_part_id
            rpt_sec_block_num
            rpt_sec_street_pfx
            rpt_sec_street_name
            rpt_sec_street_sfx
            rpt_ref_mark_offset_amt
            rpt_ref_mark_dist_uom
            rpt_ref_mark_dir
            rpt_ref_mark_nbr
            rpt_sec_street_desc
            rpt_crossingnumber
            wthr_cond_id
            light_cond_id
            entr_road_id
            road_type_id
            road_algn_id
            surf_cond_id
            traffic_cntl_id
            investigat_notify_time
            investigat_notify_meth
            investigat_arrv_time
            report_date
            investigat_comp_fl
            investigator_name
            id_number
            ori_number
            investigat_agency_id
            investigat_area_id
            investigat_district_id
            investigat_region_id
            bridge_detail_id
            harm_evnt_id
            intrsct_relat_id
            fhe_collsn_id
            obj_struck_id
            othr_factr_id
            road_part_adj_id
            road_cls_id
            road_relat_id
            phys_featr_1_id
            phys_featr_2_id
            cnty_id
            city_id
            latitude
            longitude
            hwy_sys
            hwy_nbr
            hwy_sfx
            dfo
            street_name
            street_nbr
            control
            section
            milepoint
            ref_mark_nbr
            ref_mark_displ
            hwy_sys_2
            hwy_nbr_2
            hwy_sfx_2
            street_name_2
            street_nbr_2
            control_2
            section_2
            milepoint_2
            txdot_rptable_fl
            onsys_fl
            rural_fl
            crash_sev_id
            pop_group_id
            located_fl
            day_of_week
            hwy_dsgn_lane_id
            hwy_dsgn_hrt_id
            hp_shldr_left
            hp_shldr_right
            hp_median_width
            base_type_id
            nbr_of_lane
            row_width_usual
            roadbed_width
            surf_width
            surf_type_id
            curb_type_left_id
            curb_type_right_id
            shldr_type_left_id
            shldr_width_left
            shldr_use_left_id
            shldr_type_right_id
            shldr_width_right
            shldr_use_right_id
            median_type_id
            median_width
            rural_urban_type_id
            func_sys_id
            adt_curnt_amt
            adt_curnt_year
            adt_adj_curnt_amt
            pct_single_trk_adt
            pct_combo_trk_adt
            trk_aadt_pct
            curve_type_id
            curve_lngth
            cd_degr
            delta_left_right_id
            dd_degr
            feature_crossed
            structure_number
            i_r_min_vert_clear
            approach_width
            bridge_median_id
            bridge_loading_type_id
            bridge_loading_in_1000_lbs
            bridge_srvc_type_on_id
            bridge_srvc_type_under_id
            culvert_type_id
            roadway_width
            deck_width
            bridge_dir_of_traffic_id
            bridge_rte_struct_func_id
            bridge_ir_struct_func_id
            crossingnumber
            rrco
            poscrossing_id
            wdcode_id
            standstop
            yield
            sus_serious_injry_cnt
            nonincap_injry_cnt
            poss_injry_cnt
            non_injry_cnt
            unkn_injry_cnt
            tot_injry_cnt
            death_cnt
            mpo_id
            investigat_service_id
            investigat_da_id
            investigator_narrative
            cr3_stored_flag
        }
        atd_txdot_changes(where: {record_type: {_eq: "crash"}, record_id: {_eq: $crashId}}) {
            change_id
            record_id
            created_timestamp
            record_type
            status {
                description
            }
            status_id
            record_json
        }
    }
`;

/**
 * Allows us to search all secondary records that are not a crash,
 * namely: all involved primary persons, persons, and units.
 * @type {gql}
 */
export const GET_CRASH_SECONDARY_RECORDS = gql`
    query findSecondaryRecords($crashId: Int) {
        atd_txdot_changes(
            where: {
                record_id: {_eq: $crashId}
            }
        ) {
            change_id
            record_id
            record_type
            record_json
        }
    }
`;

/**
 * This is a GraphQL template that removes all change records in the
 * changes table by CrashID upon being discarded.
 * @type {string}
 */
export const CRASH_MUTATION_DISCARD = `
    mutation discardChanges($crashId: Int) {
      delete_atd_txdot_changes(where: {record_id: {_eq: $crashId}}) {
        affected_rows
      }
    }
`

/**
 * This is a GraphQL query template that updates existing records
 * of a specific type. E.g., it expects one or many Units, or Persons
 * or Crashes. The function name matches a Hasura insertion method.
 * @type {string}
 */

export const RECORD_MUTATION_UPDATE = `
        %FUNCTION_NAME%(         
            objects: [
                %UPDATE_FIELDS%
            ],
            on_conflict: {
              constraint: %CONSTRAINT_NAME%,
              update_columns: [
                updated_by
                %SELECTED_COLUMNS%
              ]
            }
        ) {
          affected_rows
        }
`;

/**
 * Removes all change records after having updated the database.
 * @type {string}
 */
export const RECORD_DELETE_CHANGE_RECORDS = `
  mutation deleteChangeRecords($crashId: Int) {
      delete_atd_txdot_changes (
          where: {
            record_id: { _eq: $crashId }
            record_type: { _in: ["crash", "unit", "primaryperson", "person"] }
          }
      ) {
        affected_rows
      }
  }
`;

/**
 * Dummy GraphQL query
 * @type {string}
 */
export const UPSERT_MUTATION_DUMMY = `
  mutation dummyQuery {
    __typename
  }
`;
