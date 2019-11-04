const locationDataMap = [
  {
    title: "Details",
    fields: {
      location_id: {
        label: "Location ID",
        editable: false,
      },
      description: {
        label: "Description",
        editable: false,
      },
      last_update: {
        label: "Last Update",
        editable: false,
        format: "datetime",
      },
      est_comp_cost: {
        label: "Estimated Comprehensive Cost",
        // If data is nested in returned data object, define path in
        //  lodash.get() format to expose in DataTable component
        dataPath: ["crashes_count_cost_summary", "est_comp_cost"],
        editable: false,
        format: "dollars",
      },
      asmp_street_level: {
        label: "ASMP Street Level",
        editable: true,
        uiType: "select",
        lookupOptions: "atd_txdot__asmp_level_lkp",
        lookupPrefix: "asmp_level",
      },
    },
  },
];

export default locationDataMap;
