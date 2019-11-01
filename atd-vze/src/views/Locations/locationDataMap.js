const locationDataMap = [
  {
    title: "Details",
    fields: {
      location_id: {
        label: "Location ID",
      },
      description: {
        label: "Description",
      },
      last_update: {
        label: "Last Update",
        format: "datetime",
      },
      est_comp_cost: {
        label: "Estimated Comprehensive Cost",
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
