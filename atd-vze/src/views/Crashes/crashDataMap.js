export const crashDataMap = [
  {
    title: "Details",
    fields: {
      crash_id: {
        label: "Crash ID",
        editable: false,
      },
      last_update: {
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
      crash_time: {
        label: "Crash Time",
        editable: false,
      },
      day_of_week: {
        label: "Day of Week",
        editable: false,
      },
      est_comp_cost: {
        label: "Est. Comprehensive Cost",
        editable: false,
        format: "dollars",
      },
      fhe_collsn_id: {
        label: "Manner of Collision ID",
        editable: false,
        uiType: "select",
        lookupOptions: "atd_txdot__collsn_lkp",
        lookupPrefix: "collsn", // We need this field so we can reference the collsn_id & collsn_desc fields in the lookup table
      },
      investigator_narrative: {
        label: "Investigator Narrative",
        editable: true,
        uiType: "text",
      },
      city_id: {
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
      road_type_id: {
        label: "Roadway Type",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__road_type_lkp",
      },
      traffic_cntl_id: {
        label: "Traffic Control",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__traffic_cntl_lkp",
      },
    },
  },
  {
    title: "Primary Street Information",
    fields: {
      street_nbr: {
        label: "Street Number",
        editable: true,
        uiType: "text",
      },
      street_name: {
        label: "Street Name",
        editable: true,
        uiType: "text",
      },
      rpt_street_desc: {
        label: "Street Description",
        editable: true,
        uiType: "text",
      },
      rpt_road_part_id: {
        label: "Roadway Part",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__road_part_lkp",
        lookupPrefix: "road_part",
      },
      rpt_rdwy_sys_id: {
        label: "Roadway System",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__rwy_sys_lkp",
        lookupPrefix: "rwy_sys",
      },
      hwy_sys: {
        label: "Highway System",
        editable: true,
        uiType: "text",
      },
      hwy_nbr: {
        label: "Highway Number",
        editable: true,
        uiType: "text",
      },
      //  TODO: Need to create hwy_sfx_lkp table when I have access to the DB directly
      hwy_sfx: {
        label: "Highway Suffix",
        editable: true,
        uiType: "text",
      },
      rpt_block_num: {
        label: "Reported Block Number",
        editable: true,
        uiType: "text",
      },
      rpt_street_pfx: {
        label: "Reported Street Prefix",
        editable: true,
        uiType: "text",
      },
      rpt_street_name: {
        label: "Reported Street Name",
        editable: true,
        uiType: "text",
      },
      // TODO: We'll probably want to validate that they are using values from the atd_txdot__street_sfx_lkp table
      // for the rpt_street_sfx & rpt_sec_street_sfx fields but the values are currently text, not ID lookups so we'll punt
      rpt_street_sfx: {
        label: "Reported Street Suffix",
        editable: true,
        uiType: "text",
      },
    },
  },
  {
    title: "Secondary Street Information",
    fields: {
      street_nbr_2: {
        label: "Secondary Street Number",
        editable: true,
        uiType: "text",
      },
      street_name_2: {
        label: "Secondary Street Name",
        editable: true,
        uiType: "text",
      },
      rpt_sec_street_desc: {
        label: "Secondary Street Description",
        editable: true,
        uiType: "text",
      },
      rpt_sec_road_part_id: {
        label: "Secondary Roadway Part",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__road_part_lkp",
        lookupPrefix: "road_part",
      },
      rpt_sec_rdwy_sys_id: {
        label: "Secondary Roadway System",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__rwy_sys_lkp",
        lookupPrefix: "rwy_sys",
      },
      hwy_sys_2: {
        label: "Secondary Highway System",
        editable: true,
        uiType: "text",
      },
      rpt_sec_hwy_num: {
        label: "Secondary Highway Number",
        editable: true,
        uiType: "text",
      },
      rpt_sec_hwy_sfx: {
        label: "Secondary Highway Suffix",
        editable: true,
        uiType: "text",
      },
      rpt_sec_block_num: {
        label: "Reported Secondary Block Number",
        editable: true,
        uiType: "text",
      },
      rpt_sec_street_pfx: {
        label: "Reported Secondary Street Prefix",
        editable: true,
        uiType: "text",
      },

      rpt_sec_street_name: {
        label: "Reported Secondary Street Name",
        editable: true,
        uiType: "text",
      },
      rpt_sec_street_sfx: {
        label: "Secondary Street Suffix",
        editable: true,
        uiType: "text",
      },
    },
  },
  {
    title: "Geocoding",
    fields: {
      latitude_primary: {
        label: "Latitude",
        editable: true,
        uiType: "text",
      },
      longitude_primary: {
        label: "Longitude",
        editable: true,
        uiType: "text",
      },
      geocode_date: {
        label: "Geocode Date",
        editable: false,
      },
      geocode_provider: {
        label: "Geocode Provider",
        editable: false,
      },
      geocode_status: {
        label: "Geocode Status",
        editable: false,
      },
      geocoded: {
        label: "Geocoded",
        editable: false,
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
    },
  },
  {
    title: "Fatalities/Injuries",
    fields: {
      crash_fatal_fl: {
        label: "Fatality Flag",
        editable: false,
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      death_cnt: {
        label: "Death Count",
        editable: false,
      },
      crash_sev_id: {
        label: "Crash Severity",
        editable: false,
        lookupOptions: "atd_txdot__injry_sev_lkp",
        lookupPrefix: "injry_sev",
      },
      non_injry_cnt: {
        label: "Not Injured Count",
        editable: false,
      },
      nonincap_injry_cnt: {
        label: "Non-incapacitating Injury Count",
        editable: false,
      },
      poss_injry_cnt: {
        label: "Possible Injury Count",
        editable: false,
      },
      sus_serious_injry_cnt: {
        label: "Suspected Serious Injury Count",
        editable: false,
      },
      tot_injry_cnt: {
        label: "Total Injury Count",
        editable: false,
      },
      unkn_injry_cnt: {
        label: "Unknown Injury Count",
        editable: false,
      },
    },
  },
  {
    title: "Flags",
    fields: {
      active_school_zone_fl: {
        label: "Active School Zone",
        editable: false,
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      at_intrsct_fl: {
        label: "Intersection-Relation Flag",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      onsys_fl: {
        label: "On TxDOT Highway System Flag",
        editable: false,
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      private_dr_fl: {
        label: "Private Drive Flag",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      road_constr_zone_fl: {
        label: "Road Construction Zone Flag",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      rpt_outside_city_limit_fl: {
        label: "Outside City Limit Flag",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      rr_relat_fl: {
        label: "Railroad Related Flag",
        editable: false,
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      schl_bus_fl: {
        label: "School Bus Flag",
        editable: false,
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
      toll_road_fl: {
        label: "Toll Road/Lane Flag",
        editable: false,
        lookupOptions: "atd_txdot__y_n_lkp",
        lookupPrefix: "y_n",
      },
    },
  },
  {
    title: "QA",
    fields: {
      approval_date: {
        label: "Approval Date",
        editable: false,
      },
      approved_by: {
        label: "Approved By",
        editable: false,
      },
      qa_status: {
        label: "QA Status",
        editable: false,
      },
    },
  },
];
