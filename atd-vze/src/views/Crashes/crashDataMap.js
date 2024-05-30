export const createCrashDataMap = isTempRecord => {
  return [
    {
      title: "Details",
      fields: {
        crash_id: {
          label: "Crash ID",
          editable: false,
        },
        updated_at: {
          label: "Last Updated",
          editable: false,
          format: "datetime",
        },
        case_id: {
          label: "Case ID",
          editable: false,
        },
        crash_date: {
          label: "Crash Date",
          editable: false,
        },
        // day_of_week: {
        //   label: "Day of Week",
        //   editable: false,
        // },
        // est_comp_cost_crash_based: {
        //   label: "Est. Comprehensive Cost",
        //   editable: false,
        //   format: "dollars",
        // },
        // est_econ_cost: {
        //   label: "Est. Economic Cost",
        //   editable: false,
        //   format: "dollars",
        // },
        // speed_mgmt_points: {
        //   label: "Speed Management Points",
        //   editable: false,
        //   format: "text",
        // },
        fhe_collsn_id: {
          label: "Manner of Collision ID",
          editable: isTempRecord,
          uiType: "select",
          lookupOptions: "atd_txdot__collsn_lkp",
          lookupPrefix: "collsn", // We need this field so we can reference the collsn_id & collsn_desc fields in the lookup table
        },
        rpt_city_id: {
          label: "City",
          editable: true,
          uiType: "select",
          lookupOptions: "atd_txdot__city_lkp",
          lookupPrefix: "city",
        },
        light_cond_id: {
          label: "Light Condition",
          editable: false,
          uiType: "select",
          lookupOptions: "atd_txdot__light_cond_lkp",
        },
        wthr_cond_id: {
          label: "Weather Condition",
          editable: false,
          uiType: "select",
          lookupOptions: "atd_txdot__wthr_cond_lkp",
        },
        obj_struck_id: {
          label: "Object Struck",
          editable: false,
          uiType: "select",
          lookupOptions: "atd_txdot__obj_struck_lkp",
        },
        crash_speed_limit: {
          label: "Speed Limit",
          editable: true,
          // TODO: Validate for integers
          uiType: "text",
        },
        // road_type_id: {
        //   label: "Roadway Type",
        //   editable: true,
        //   uiType: "select",
        //   lookupOptions: "atd_txdot__road_type_lkp",
        // },
        traffic_cntl_id: {
          label: "Traffic Control",
          editable: true,
          uiType: "select",
          lookupOptions: "atd_txdot__traffic_cntl_lkp",
        },
      },
    },
    // {
    //   title: "Injuries",
    //   button: {
    //     buttonText: "Reset to CRIS Data",
    //     // Define conditions for when button should appear
    //     buttonCondition: {
    //       dataTableName: "atd_txdot_crashes",
    //       dataPath: "apd_human_update",
    //       value: "Y",
    //     },
    //     buttonFieldUpdate: {
    //       field: "apd_confirmed_death_count",
    //       dataTableName: "atd_txdot_crashes",
    //       dataPath: "death_cnt",
    //     },
    //     buttonConfirm: {
    //       confirmHeader: "Are you sure?",
    //       confirmBody:
    //         "Are you sure you want to revert to the original value from the CRIS database?",
    //     },
    //     secondaryFieldUpdate: { apd_human_update: "N" },
    //   },
    //   fields: {
    //     crash_sev_id: {
    //       label: "Crash Severity",
    //       editable: false,
    //       uiType: "select",
    //       lookupOptions: "atd_txdot__injry_sev_lkp",
    //       lookupPrefix: "injry_sev",
    //     },
    //     non_injry_cnt: {
    //       label: "Not Injured Count",
    //       editable: false,
    //     },
    //     nonincap_injry_cnt: {
    //       label: "Non-incapacitating Injury Count",
    //       editable: false,
    //     },
    //     poss_injry_cnt: {
    //       label: "Possible Injury Count",
    //       editable: false,
    //     },
    //     sus_serious_injry_cnt: {
    //       label: "Suspected Serious Injury Count",
    //       editable: false,
    //       uiType: "text",
    //     },
    //     tot_injry_cnt: {
    //       label: "Total Injury Count",
    //       editable: false,
    //       uiType: "text",
    //     },
    //     unkn_injry_cnt: {
    //       label: "Unknown Injury Count",
    //       editable: false,
    //     },
    //     vz_fatality_count: {
    //       label: "ATD Fatality Count",
    //       editable: false,
    //       uiType: "text",
    //     },
    //     death_cnt: {
    //       label: "CRIS Death Count",
    //       editable: false,
    //     },
    //     apd_confirmed_death_count: {
    //       label: "APD Death Count",
    //       editable: false,
    //       uiType: "text",
    //       secondaryFieldUpdate: { apd_human_update: "Y" },
    //     },
    //     law_enforcement_num: {
    //       label: "Law Enforcement Number",
    //       editable: true,
    //       uiType: "text",
    //     },
    //   },
    // },
    {
      title: "Primary Street Information",
      fields: {
        address_primary: {
          label: "Primary Address",
          editable: false,
          uiType: "text",
        },
        rpt_block_num: {
          label: "Street Number",
          editable: false,
          uiType: "text",
        },
        rpt_street_name: {
          label: "Street Name",
          editable: false,
          uiType: "text",
        },
        rpt_street_desc: {
          label: "Street Description",
          editable: false,
          uiType: "text",
        },
        rpt_road_part_id: {
          label: "Roadway Part",
          editable: false,
          uiType: "select",
          lookupOptions: "atd_txdot__road_part_lkp",
          lookupPrefix: "road_part",
        },
        rpt_rdwy_sys_id: {
          label: "Roadway System",
          editable: false,
          uiType: "select",
          lookupOptions: "atd_txdot__rwy_sys_lkp",
          lookupPrefix: "rwy_sys",
        },
        rpt_hwy_num: {
          label: "Highway Number",
          editable: false,
          uiType: "text",
        },
        rpt_street_pfx: {
          label: "Street Prefix",
          editable: false,
          uiType: "text",
        },
        // TODO: We'll probably want to validate that they are using values from the atd_txdot__street_sfx_lkp table
        // for the rpt_street_sfx & rpt_sec_street_sfx fields but the values are currently text, not ID lookups so we'll punt
        rpt_street_sfx: {
          label: "Street Suffix",
          editable: false,
          uiType: "text",
        },
      },
    },
    {
      title: "Secondary Street Information",
      fields: {
        address_secondary: {
          label: "Secondary Address",
          editable: false,
          uiType: "text",
        },
        rpt_sec_block_num: {
          label: "Secondary Street Number",
          editable: false,
          uiType: "text",
        },
        rpt_sec_street_name: {
          label: "Secondary Street Name",
          editable: false,
          uiType: "text",
        },
        rpt_sec_street_desc: {
          label: "Secondary Street Description",
          editable: false,
          uiType: "text",
        },
        rpt_sec_road_part_id: {
          label: "Secondary Roadway Part",
          editable: false,
          uiType: "select",
          lookupOptions: "atd_txdot__road_part_lkp",
          lookupPrefix: "road_part",
        },
        rpt_sec_rdwy_sys_id: {
          label: "Secondary Roadway System",
          editable: false,
          uiType: "select",
          lookupOptions: "atd_txdot__rwy_sys_lkp",
          lookupPrefix: "rwy_sys",
        },
        rpt_sec_hwy_num: {
          label: "Secondary Highway Number",
          editable: false,
          uiType: "text",
        },
        rpt_sec_street_pfx: {
          label: "Secondary Street Prefix",
          editable: false,
          uiType: "text",
        },
        rpt_sec_street_sfx: {
          label: "Secondary Street Suffix",
          editable: false,
          uiType: "text",
        },
      },
    },
    {
      title: "Flags",
      fields: {
        active_school_zone_fl: {
          label: "Active School Zone",
          editable: false,
          uiType: "boolean",
        },
        at_intrsct_fl: {
          label: "Intersection-Relation Flag",
          editable: true,
          uiType: "boolean",
        },
        onsys_fl: {
          label: "On TxDOT Highway System Flag",
          editable: isTempRecord,
          uiType: "boolean",
        },
        private_dr_fl: {
          label: "Private Drive Flag",
          editable: true,
          uiType: "boolean",
        },
        road_constr_zone_fl: {
          label: "Road Construction Zone Flag",
          editable: true,
          uiType: "boolean",
        },
        rr_relat_fl: {
          label: "Railroad Related Flag",
          editable: false,
          uiType: "boolean",
        },
        schl_bus_fl: {
          label: "School Bus Flag",
          editable: false,
          uiType: "boolean",
        },
        toll_road_fl: {
          label: "Toll Road/Lane Flag",
          editable: false,
          uiType: "boolean",
        },
      },
    },
  ];
};
