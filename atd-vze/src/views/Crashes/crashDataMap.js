export const crashDataMap = [
  {
    title: "Details",
    fields: {
      case_id: {
        label: "Case ID",
        editable: false,
      },
      crash_date: {
        label: "Crash Date",
        editable: false,
      },
      crash_id: {
        label: "Crash ID",
        editable: false,
      },
      crash_speed_limit: {
        label: "Speed Limit",
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
      fhe_collsn_id: {
        label: "Manner of Collision ID",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__collsn_lkp",
        lookupPrefix: "collsn", // We need this field so we can reference the collsn_id & collsn_desc fields in the lookup table
      },
      last_update: {
        label: "Last Updated",
        editable: false,
      },
      investigator_narrative: {
        label: "Investigator Narrative",
        editable: true,
        uiType: "text",
      },
      light_cond_id: {
        label: "Light Condition",
        editable: false,
      },
      obj_struck_id: {
        label: "Object Struck ID",
        editable: false,
      },
      road_type_id: {
        label: "Roadway Type ID",
        editable: false,
      },
      traffic_cntl_id: {
        label: "Traffic Control ID",
        editable: false,
      },
      wthr_cond_id: {
        label: "Weather Condition ID",
        editable: false,
      },
      // is_retired: "Is Retired", // All these return false, why?
    },
  },
  {
    title: "Fatalities/Injuries",
    fields: {
      crash_fatal_fl: {
        label: "Fatality Flag",
        editable: false,
      },
      death_cnt: {
        label: "Death Count",
        editable: false,
      },
      crash_sev_id: {
        label: "Crash Severity ID",
        editable: false,
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
    title: "Address/Geo",
    fields: {
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
      },
      hwy_nbr: {
        label: "Highway Number",
        editable: false,
      },
      hwy_sfx: {
        label: "Highway Suffix",
        editable: false,
      },
      hwy_sys: {
        label: "Highway System",
        editable: false,
      },
      intrsct_relat_id: {
        label: "Intersection Related ID",
        editable: false,
      },
      latitude: {
        label: "Latitude",
        editable: false,
      },
      latitude_primary: {
        label: "Latitude Primary",
        editable: false,
      },
      latitude_geocoded: {
        label: "Latitude Geocode",
        editable: false,
      },
      longitude: {
        label: "Longitude",
        editable: false,
      },
      longitude_primary: {
        label: "Longitude Primary",
        editable: false,
      },
      longitude_geocoded: {
        label: "Longitude Geocoded",
        editable: false,
      },
      position: {
        label: "Position",
        editable: false,
      },
      rpt_rdwy_sys_id: {
        label: "Roadway System ID",
        editable: false,
      },
      rpt_road_part_id: {
        label: "Roadway Part ID",
        editable: false,
      },
      rpt_sec_block_num: {
        label: "Secondary Block Number",
        editable: false,
      },
      rpt_sec_hwy_num: {
        label: "Secondary Highway Number",
        editable: false,
      },
      rpt_sec_hwy_sfx: {
        label: "Secondary Highway Suffix",
        editable: false,
      },
      rpt_sec_rdwy_sys_id: {
        label: "Secondary Roadway System ID",
        editable: false,
      },
      rpt_sec_road_part_id: {
        label: "Secondary Roadway Part ID",
        editable: false,
      },
      rpt_sec_street_desc: {
        label: "Secondary Street Description",
        editable: false,
      },
      rpt_sec_street_name: {
        label: "Secondary Street Name",
        editable: false,
      },
      rpt_sec_street_pfx: {
        label: "Secondary Street Prefix",
        editable: false,
      },
      rpt_sec_street_sfx: {
        label: "Secondary Street Suffix",
        editable: false,
      },
      rpt_street_name: {
        label: "Reported Street Name",
        editable: false,
      },
      rpt_street_pfx: {
        label: "Reported Street Prefix",
        editable: false,
      },
      rpt_street_sfx: {
        label: "Reported Street Suffix",
        editable: false,
      },
      rpt_block_num: {
        label: "Block Number",
        editable: false,
      },
      rpt_city_id: {
        label: "City ID",
        editable: false,
      },
      rpt_hwy_num: {
        label: "Highway Number",
        editable: false,
      },
      rpt_hwy_sfx: {
        label: "Highway Suffix",
        editable: false,
      },
      rpt_latitude: {
        label: "Reported Latitude",
        editable: false,
      },
      rpt_longitude: {
        label: "Reported Longitude",
        editable: false,
      },
      street_name: {
        label: "Street Name",
        editable: false,
      },
      street_name_2: {
        label: "Street Name 2",
        editable: false,
      },
      street_nbr: {
        label: "Street Number",
        editable: false,
      },
      street_nbr_2: {
        label: "Street Number 2",
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
      },
      at_intrsct_fl: {
        label: "Intersection-Relation Flag",
        editable: false,
      },
      onsys_fl: {
        label: "On TxDOT Highway System Flag",
        editable: false,
      },
      private_dr_fl: {
        label: "Private Drive Flag",
        editable: false,
      },
      road_constr_zone_fl: {
        label: "Road Construction Zone Flag",
        editable: false,
      },
      rpt_outside_city_limit_fl: {
        label: "Outside City Limit Flag",
        editable: false,
      },
      rr_relat_fl: {
        label: "Railroad Related Flag",
        editable: false,
      },
      schl_bus_fl: {
        label: "School Bus Flag",
        editable: false,
      },
      toll_road_fl: {
        label: "Toll Road/Lane Flag",
        editable: false,
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
