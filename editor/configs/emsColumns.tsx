import { getInjuryColorClass } from "@/utils/people";
import { ColDataCardDef } from "@/types/types";
import { EMSPatientCareRecord } from "@/types/ems";
import { formatDate } from "@/utils/formatters";

const formatCrashMatchStatus = (value: unknown) => {
  if (!value || typeof value !== "string") {
    return "";
  }
  switch (value) {
    case "unmatched":
      return "Unmatched";
    case "multiple_matches_by_automation":
      return "Multiple";
    case "matched_by_automation":
      return "Matched automatically";
    case "matched_by_manual_qa":
      return "Matched by review/QA";
    default:
      return "";
  }
};

export const ALL_EMS_COLUMNS = {
  apd_incident_numbers: {
    path: "apd_incident_numbers",
    label: "APD Case IDs",
    valueFormatter: (value) => (Array.isArray(value) ? value.join(", ") : ""),
  },
  crash_match_status: {
    path: "crash_match_status",
    label: "Crash match status",
    valueFormatter: formatCrashMatchStatus,
    sortable: true,
  },
  crash_pk: {
    path: "crash_pk",
    label: "Crash ID",
  },
  id: {
    path: "id",
    label: "ID",
    sortable: true,
  },
  incident_location_address: {
    path: "incident_location_address",
    label: "Incident address",
    sortable: true,
  },
  incident_number: {
    path: "incident_number",
    label: "Incident #",
    sortable: true,
  },
  incident_problem: {
    path: "incident_problem",
    label: "Incident problem",
    sortable: true,
  },
  incident_received_datetime: {
    path: "incident_received_datetime",
    label: "Date",
    style: { whiteSpace: "nowrap" },
    valueFormatter: formatDate,
    sortable: true,
  },
  mvc_form_position_in_vehicle: {
    path: "mvc_form_position_in_vehicle",
    label: "Position in vehicle",
    sortable: true,
  },
  pcr_patient_age: { path: "pcr_patient_age", label: "Age" },
  pcr_patient_gender: { path: "pcr_patient_gender", label: "Sex" },
  pcr_patient_race: { path: "pcr_patient_race", label: "Race" },
  patient_injry_sev_id: {
    path: "injry_sev.label",
    label: "Injury severity",
    relationship: {
      tableSchema: "lookups",
      tableName: "injry_sev",
      foreignKey: "patient_injry_sev_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
    valueRenderer: (record) => {
      const value = record.injry_sev.label;
      const className = `${getInjuryColorClass(value)} px-2 py-1 rounded`;
      return <span className={className}>{value}</span>;
    },
    style: { whiteSpace: "nowrap" },
    sortable: true,
  },
  travel_mode: { path: "travel_mode", label: "Travel mode", sortable: true },
} satisfies Record<string, ColDataCardDef<EMSPatientCareRecord>>;

export const emsListViewColumns: ColDataCardDef<EMSPatientCareRecord>[] = [
  ALL_EMS_COLUMNS.id,
  ALL_EMS_COLUMNS.incident_number,
  ALL_EMS_COLUMNS.incident_received_datetime,
  ALL_EMS_COLUMNS.incident_location_address,
  ALL_EMS_COLUMNS.travel_mode,
  ALL_EMS_COLUMNS.incident_problem,
  ALL_EMS_COLUMNS.patient_injry_sev_id,
  ALL_EMS_COLUMNS.mvc_form_position_in_vehicle,
  ALL_EMS_COLUMNS.apd_incident_numbers,
  ALL_EMS_COLUMNS.crash_match_status,
];
