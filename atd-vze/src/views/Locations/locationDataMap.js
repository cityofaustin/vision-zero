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
      },
      total_est_comp_cost: {
        label: "Total Estimated Comprehensive Cost (Previous 5 years)",
        alternateTable: "locationTotals",
        editable: false,
        format: "dollars",
      },
      street_level: {
        label: "ASMP Street Level",
        editable: false,
      },
    },
  },
];

export default locationDataMap;
