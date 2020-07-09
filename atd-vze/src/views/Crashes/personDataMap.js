const getInjurySeverityColor = desc => {
  switch (desc) {
    case "UNKNOWN":
      return "muted";
    case "NOT INJURED":
      return "primary";
    case "INCAPACITATING INJURY":
      return "warning";
    case "NON-INCAPACITATING INJURY":
      return "warning";
    case "POSSIBLE INJURY":
      return "warning";
    case "KILLED":
      return "danger";
    default:
      break;
  }
};

export const primaryPersonDataMap = [
  {
    title: "Drivers/Primary People",
    fields: {
      unit_nbr: {
        label: "Unit",
        editable: false,
      },
      injury_severity: {
        label: "Injury Severity",
        editable: true,
        format: "select",
        lookup_desc: "injry_sev_desc",
        lookupOptions: "atd_txdot__injry_sev_lkp",
        lookupPrefix: "injry_sev",
        badge: true,
        badgeColor: getInjurySeverityColor,
      },
      person_type: {
        label: "Type",
        editable: false,
        lookup_desc: "prsn_type_desc",
      },
      prsn_age: {
        label: "Age",
        editable: false,
      },
      drvr_city_name: {
        label: "City",
        editable: false,
      },
      drvr_zip: {
        label: "ZIP",
        editable: false,
      },
    },
  },
];

export const personDataMap = [
  {
    title: "Other People",
    fields: {
      unit_nbr: {
        label: "Unit",
        editable: false,
      },
      injury_severity: {
        label: "Injury Severity",
        editable: true,
        format: "select",
        lookup_desc: "injry_sev_desc",
        lookupOptions: "atd_txdot__injry_sev_lkp",
        lookupPrefix: "injry_sev",
        badge: true,
        badgeColor: getInjurySeverityColor,
      },
      person_type: {
        label: "Type",
        editable: false,
        lookup_desc: "prsn_type_desc",
      },
      prsn_age: {
        label: "Age",
        editable: false,
      },
    },
  },
];
