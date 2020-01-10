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
      total_crashes: {
        label: "Total Crashes (Previous 5 years)",
        alternateTable: "locationTotals",
        editable: false,
        // Set default value in case of no crashes in previous n years
        defaultValue: "0",
      },
      total_est_comp_cost: {
        label: "Total Estimated Comprehensive Cost (Previous 5 years)",
        alternateTable: "locationTotals",
        editable: false,
        format: "dollars",
        // Set default value in case of no crashes in previous n years
        defaultValue: "0",
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
