import { isAdmin, isItSupervisor } from "../../auth/authContext";

// Return true if person record is a fatality
const shouldRenderVictimName = (data, roles) => {
  return (
    data.some(person => person.prsn_injry_sev_id === 4) &&
    (isItSupervisor(roles) || isAdmin(roles))
  );
};

const getInjurySeverityColor = personRecord => {
  switch (personRecord["prsn_injry_sev_id"]) {
    case 0: // UNKNOWN: no color
      return "muted";
    case 1: // SUSPECTED INCAPACITATING INJURY: yellow
      return "warning";
    case 2: // SUSPECTED MINOR INJURY: yellow
      return "warning";
    case 3: // POSSIBLE INJURY: blue
      return "primary";
    case 4: // FATAL INJURY: red
      return "danger";
    case 99: // KILLED: red
      return "secondary";
    default:
      // Other cases: Not reported, Reported invalid, Not injured
      return "secondary";
  }
};

export const primaryPersonDataMap = [
  {
    title: "Drivers/Primary People",
    mutationVariableKey: "personId",

    fields: {
      // unit_nbr: {
      //   label: "Unit",
      //   editable: false,
      // },
      // injury_severity: {
      //   label: "Injury Severity",
      //   editable: true,
      //   format: "select",
      //   lookup_desc: "injry_sev_desc",
      //   lookupOptions: "atd_txdot__injry_sev_lkp",
      //   lookupPrefix: "injry_sev",
      //   updateFieldKey: "prsn_injry_sev_id",
      //   mutationVariableKey: "personId",
      //   badge: true,
      //   badgeColor: getInjurySeverityColor,
      // },
      // victim_name: {
      //   label: "Victim Name",
      //   editable: true,
      //   format: "text",
      //   mutationVariableKey: "personId",
      //   shouldRender: shouldRenderVictimName,
      //   subfields: {
      //     prsn_first_name: {
      //       label: "First",
      //     },
      //     prsn_mid_name: {
      //       label: "Middle",
      //     },
      //     prsn_last_name: {
      //       label: "Last",
      //     },
      //   },
      // },
      // person_type: {
      //   label: "Type",
      //   editable: false,
      //   lookup_desc: "prsn_type_desc",
      // },
      prsn_age: {
        label: "Age",
        editable: true,
        format: "text",
        mutationVariableKey: "personId",
      },
      // gender: {
      //   label: "Sex",
      //   editable: true,
      //   lookup_desc: "gndr_desc",
      //   format: "select",
      //   lookupOptions: "atd_txdot__gndr_lkp",
      //   lookupPrefix: "gndr",
      //   updateFieldKey: "prsn_gndr_id",
      //   mutationVariableKey: "personId",
      // },
      // ethnicity: {
      //   label: "Race/Ethnicity",
      //   editable: true,
      //   lookup_desc: "ethnicity_desc",
      //   format: "select",
      //   lookupOptions: "atd_txdot__ethnicity_lkp",
      //   lookupPrefix: "ethnicity",
      //   updateFieldKey: "prsn_ethnicity_id",
      //   mutationVariableKey: "personId",
      // },
      drvr_city_name: {
        label: "City",
        editable: false,
      },
      drvr_zip: {
        label: "ZIP",
        editable: false,
      },
      // peh_fl: {
      //   label: "Suspected Unhoused",
      //   editable: true,
      //   format: "boolean",
      //   mutationVariableKey: "personId",
      // },
    },
  },
];

export const personDataMap = [
  {
    title: "Other People",
    mutationVariableKey: "personId",

    fields: {
      // unit_nbr: {
      //   label: "Unit",
      //   editable: false,
      // },
      // injury_severity: {
      //   label: "Injury Severity",
      //   editable: true,
      //   format: "select",
      //   lookup_desc: "injry_sev_desc",
      //   lookupOptions: "atd_txdot__injry_sev_lkp",
      //   lookupPrefix: "injry_sev",
      //   updateFieldKey: "prsn_injry_sev_id",
      //   mutationVariableKey: "personId",
      //   badge: true,
      //   badgeColor: getInjurySeverityColor,
      // },
      // victim_name: {
      //   label: "Victim Name",
      //   editable: true,
      //   format: "text",
      //   shouldRender: shouldRenderVictimName,
      //   mutationVariableKey: "personId",
      //   subfields: {
      //     prsn_first_name: {
      //       label: "First",
      //     },
      //     prsn_mid_name: {
      //       label: "Middle",
      //     },
      //     prsn_last_name: {
      //       label: "Last",
      //     },
      //   },
      // },
      // person_type: {
      //   label: "Type",
      //   editable: false,
      //   lookup_desc: "prsn_type_desc",
      // },
      prsn_age: {
        label: "Age",
        editable: true,
        format: "text",
        mutationVariableKey: "personId",
      },
      // gender: {
      //   label: "Sex",
      //   editable: true,
      //   lookup_desc: "gndr_desc",
      //   format: "select",
      //   lookupOptions: "atd_txdot__gndr_lkp",
      //   lookupPrefix: "gndr",
      //   updateFieldKey: "prsn_gndr_id",
      //   mutationVariableKey: "personId",
      // },
      // ethnicity: {
      //   label: "Race/Ethnicity",
      //   editable: true,
      //   lookup_desc: "ethnicity_desc",
      //   format: "select",
      //   lookupOptions: "atd_txdot__ethnicity_lkp",
      //   lookupPrefix: "ethnicity",
      //   updateFieldKey: "prsn_ethnicity_id",
      //   mutationVariableKey: "personId",
      // },
      // peh_fl: {
      //   label: "Suspected Unhoused",
      //   editable: true,
      //   format: "boolean",
      //   mutationVariableKey: "personId",
      // },
    },
  },
];
