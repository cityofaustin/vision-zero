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
      cr3_total_est_comp_cost: {
        label: "CR3 Estimated Comprehensive Cost",
        alternateTable: "cr3Totals",
        editable: false,
        format: "dollars",
      },
      cr3_total_crashes: {
        label: "CR3 Total Crashes",
        alternateTable: "cr3Totals",
        editable: false,
      },
      noncr3_total_est_comp_cost: {
        label: "Non-CR3 Estimated Comprehensive Cost",
        alternateTable: "nonCr3Totals",
        editable: false,
        format: "dollars",
      },
      noncr3_total_crashes: {
        label: "Non-CR3 Total Crashes",
        alternateTable: "nonCr3Totals",
        editable: false,
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
