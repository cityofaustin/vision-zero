/**
 * The Crash important difference fields is an object that contains the fields (as a key)
 * and its attributes (as a value).
 * @type {object}
 */

export const crashFieldDescription = {
  crash: {
    case_id: {
      type: "string",
    },
    crash_string: {
      type: "string",
    },
    crash_time: {
      type: "string",
    },
    crash_fatal_fl: {
      type: "string",
    },
    private_dr_fl: {
      type: "string",
    },
    rpt_outside_city_limit_fl: {
      type: "string",
    },
    rpt_latitude: {
      type: "double",
    },
    rpt_longitude: {
      type: "double",
    },
    rpt_hwy_num: {
      type: "string",
    },
    rpt_block_num: {
      type: "string",
    },
    rpt_street_name: {
      type: "string",
    },
    rpt_sec_hwy_num: {
      type: "string",
    },
    rpt_sec_block_num: {
      type: "string",
    },
    rpt_sec_street_name: {
      type: "string",
    },
    hwy_nbr: {
      type: "string",
    },
    hwy_sys: {
      type: "string",
    },
    hwy_sys_2: {
      type: "string",
    },
    hwy_nbr_2: {
      type: "string",
    },
    city_id: {
      type: "integer",
    },
    latitude: {
      type: "double",
    },
    longitude: {
      type: "double",
    },
    street_name: {
      type: "string",
    },
    street_nbr: {
      type: "string",
    },
    street_name_2: {
      type: "string",
    },
    street_nbr_2: {
      type: "string",
    },
    sus_serious_injry_cnt: {
      type: "integer",
    },
    nonincap_injry_cnt: {
      type: "integer",
    },
    poss_injry_cnt: {
      type: "integer",
    },
    non_injry_cnt: {
      type: "integer",
    },
    unkn_injry_cnt: {
      type: "integer",
    },
    tot_injry_cnt: {
      type: "integer",
    },
    death_cnt: {
      type: "integer",
    },
  },

  primaryperson: {
    crash_id: { type: "integer" },
    unit_nbr: { type: "integer" },
    prsn_nbr: { type: "integer" },
    prsn_type_id: { type: "integer" },
    prsn_occpnt_pos_id: { type: "integer" },
    prsn_name_honorific: { type: "string" },
    prsn_injry_sev_id: { type: "integer" },
    prsn_age: { type: "integer" },
    prsn_ethnicity_id: { type: "integer" },
    prsn_gndr_id: { type: "integer" },
    prsn_ejct_id: { type: "integer" },
    prsn_rest_id: { type: "integer" },
    prsn_airbag_id: { type: "integer" },
    prsn_helmet_id: { type: "integer" },
    prsn_sol_fl: { type: "string" },
    prsn_alc_spec_type_id: { type: "integer" },
    prsn_alc_rslt_id: { type: "integer" },
    prsn_bac_test_rslt: { type: "string" },
    prsn_drg_spec_type_id: { type: "integer" },
    prsn_drg_rslt_id: { type: "integer" },
    drvr_drg_cat_1_id: { type: "integer" },
    prsn_taken_to: { type: "string" },
    prsn_taken_by: { type: "string" },
    prsn_death_string: { type: "string" },
    prsn_death_time: { type: "string" },
    sus_serious_injry_cnt: { type: "integer" },
    nonincap_injry_cnt: { type: "integer" },
    poss_injry_cnt: { type: "integer" },
    non_injry_cnt: { type: "integer" },
    unkn_injry_cnt: { type: "integer" },
    tot_injry_cnt: { type: "integer" },
    death_cnt: { type: "integer" },
    drvr_lic_type_id: { type: "integer" },
    drvr_lic_cls_id: { type: "integer" },
    drvr_city_name: { type: "string" },
    drvr_state_id: { type: "integer" },
    drvr_zip: { type: "string" },
    last_upstring: { type: "string" },
    upstringd_by: { type: "string" },
    primaryperson_id: { type: "integer" },
    is_retired: { type: "boolean" },
    years_of_life_lost: { type: "integer" },
  },
};
