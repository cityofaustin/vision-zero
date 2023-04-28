// Check if victim name column should render
const shouldRenderVictimName = data => {
  console.log(data);
  if (data.find(person => person.prsn_injry_sev_id === 4)) {
    return true;
  }
  return false;
};

const getInjurySeverityColor = desc => {
  switch (desc) {
    case "UNKNOWN":
      return "muted";
    case "NOT INJURED":
      return "primary";
    case "SUSPECTED SERIOUS INJURY" || "INCAPACITATING INJURY":
      // INCAPACITATING INJURY is deprecated terminology but including
      // a fallback here just in case.
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
    mutationVariableKey: "personId",

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
        updateFieldKey: "prsn_injry_sev_id",
        mutationVariableKey: "personId",
        badge: true,
        badgeColor: getInjurySeverityColor,
      },
      fatality: {
        label: "Victim Name",
        editable: true,
        format: "text",
        lookup_desc: "victim_name",
        updateFieldKey: "victim_name",
        lookupOptions: "fatalities",
        mutationVariableKey: "personId",
        render: shouldRenderVictimName,
      },
      person_type: {
        label: "Type",
        editable: false,
        lookup_desc: "prsn_type_desc",
      },
      prsn_age: {
        label: "Age",
        editable: true,
        format: "text",
        mutationVariableKey: "personId",
      },
      gender: {
        label: "Sex",
        editable: true,
        lookup_desc: "gndr_desc",
        format: "select",
        lookupOptions: "atd_txdot__gndr_lkp",
        lookupPrefix: "gndr",
        updateFieldKey: "prsn_gndr_id",
        mutationVariableKey: "personId",
      },
      ethnicity: {
        label: "Race/Ethnicity",
        editable: true,
        lookup_desc: "ethnicity_desc",
        format: "select",
        lookupOptions: "atd_txdot__ethnicity_lkp",
        lookupPrefix: "ethnicity",
        updateFieldKey: "prsn_ethnicity_id",
        mutationVariableKey: "personId",
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
    mutationVariableKey: "personId",

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
        updateFieldKey: "prsn_injry_sev_id",
        mutationVariableKey: "personId",
        badge: true,
        badgeColor: getInjurySeverityColor,
      },
      fatality: {
        label: "Victim Name",
        editable: true,
        format: "text",
        lookup_desc: "victim_name",
        updateFieldKey: "victim_name",
        lookupOptions: "fatalities",
        mutationVariableKey: "personId",
        render: shouldRenderVictimName,
      },
      person_type: {
        label: "Type",
        editable: false,
        lookup_desc: "prsn_type_desc",
      },
      prsn_age: {
        label: "Age",
        editable: true,
        format: "text",
        mutationVariableKey: "personId",
      },
      gender: {
        label: "Sex",
        editable: true,
        lookup_desc: "gndr_desc",
        format: "select",
        lookupOptions: "atd_txdot__gndr_lkp",
        lookupPrefix: "gndr",
        updateFieldKey: "prsn_gndr_id",
        mutationVariableKey: "personId",
      },
      ethnicity: {
        label: "Race/Ethnicity",
        editable: true,
        lookup_desc: "ethnicity_desc",
        format: "select",
        lookupOptions: "atd_txdot__ethnicity_lkp",
        lookupPrefix: "ethnicity",
        updateFieldKey: "prsn_ethnicity_id",
        mutationVariableKey: "personId",
      },
    },
  },
];
