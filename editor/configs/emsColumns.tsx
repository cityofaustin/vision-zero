import { getInjuryColorClass } from "@/utils/people";
import { ColDataCardDef } from "@/types/types";
import { EMSPatientCareRecord } from "@/types/ems";
import { formatDate, formatIsoDateTime } from "@/utils/formatters";
import Link from "next/link";
import { ClientError } from "graphql-request";

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
    case "unmatched_by_manual_qa":
      return "Unmatched by review/QA";
    default:
      return "";
  }
};

export const ALL_EMS_COLUMNS = {
  apd_incident_numbers: {
    path: "apd_incident_numbers",
    label: "APD Case IDs",
    sortable: true,
    valueFormatter: (value) => (Array.isArray(value) ? value.join(", ") : ""),
  },
  crash_match_status: {
    path: "crash_match_status",
    label: "Crash match status",
    valueFormatter: formatCrashMatchStatus,
    sortable: true,
  },
  non_cr3_match_status: {
    path: "non_cr3_match_status",
    label: "Non-CR3 match status",
    valueFormatter: formatCrashMatchStatus,
    sortable: true,
  },
  atd_apd_blueform_case_id: {
    path: "atd_apd_blueform_case_id",
    label: "Non-CR3 Case ID",
    sortable: true,
  },
  crash_pk: {
    path: "crash_pk",
    label: "Crash ID",
  },
  cris_crash_id: {
    path: "crash.cris_crash_id",
    label: "Crash ID",
    relationship: {
      tableSchema: "public",
      tableName: "crashes",
      foreignKey: "crash_pk",
      idColumnName: "cris_crash_id",
      labelColumnName: "Crash ID",
    },
    valueRenderer: (record: EMSPatientCareRecord) => {
      if (!record.crash?.cris_crash_id) {
        return "";
      }
      return (
        <Link href={`/crashes/${record.crash.cris_crash_id}`} prefetch={false}>
          {record.crash.cris_crash_id}
        </Link>
      );
    },
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
    label: "Incident",
    sortable: true,
    valueRenderer: (record: EMSPatientCareRecord) => (
      <Link href={`/ems/${record.incident_number}`} prefetch={false}>
        <span style={{ whiteSpace: "nowrap" }}>{record.incident_number}</span>
      </Link>
    ),
  },
  incident_problem: {
    path: "incident_problem",
    label: "Problem",
    sortable: true,
  },
  incident_received_datetime_with_timestamp: {
    path: "incident_received_datetime",
    label: "Date",
    style: { whiteSpace: "nowrap" },
    valueFormatter: formatIsoDateTime,
    sortable: true,
  },
  incident_received_datetime: {
    path: "incident_received_datetime",
    label: "Date",
    style: { whiteSpace: "nowrap" },
    valueFormatter: formatDate,
    sortable: true,
  },
  person_id: {
    path: "person_id",
    label: "Person ID",
    editable: true,
    inputType: "number",
    getMutationErrorMessage: (error) => {
      if (error instanceof ClientError) {
        // Assume the problem is related to the person ID
        return "Person ID is invalid or in use";
      } else if (error instanceof Error) {
        // Handle other errors
        return "Something went wrong";
      }
      return null;
    },
  },
  prsn_nbr: {
    path: "person.prsn_nbr",
    label: "Person",
  },
  unit_nbr: {
    path: "person.unit_nbr",
    label: "Unit",
  },
  mvc_form_position_in_vehicle: {
    path: "mvc_form_position_in_vehicle",
    label: "Position in vehicle",
    sortable: true,
  },
  pcr_patient_age: { path: "pcr_patient_age", label: "Age" },
  pcr_patient_gender: { path: "pcr_patient_gender", label: "Sex" },
  pcr_patient_race: { path: "pcr_patient_race", label: "Race" },
  pcr_transport_destination: {
    path: "pcr_transport_destination",
    label: "Transported to",
  },
  patient_injry_sev: {
    path: "patient_injry_sev.label",
    label: "Injury severity",
    relationship: {
      tableSchema: "lookups",
      tableName: "ems_patient_injry_sev",
      foreignKey: "patient_injry_sev_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
    valueRenderer: (record) => {
      const value = record?.patient_injry_sev?.label || "";
      const className = `${getInjuryColorClass(value)} px-2 py-1 rounded`;
      return <span className={className}>{value}</span>;
    },
    style: { whiteSpace: "nowrap" },
    sortable: true,
  },
  patient_injry_sev_reason: {
    path: "patient_injry_sev_reason",
    label: "Injury severity reason",
    defaultHidden: true,
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
  ALL_EMS_COLUMNS.patient_injry_sev,
  ALL_EMS_COLUMNS.mvc_form_position_in_vehicle,
  ALL_EMS_COLUMNS.apd_incident_numbers,
  ALL_EMS_COLUMNS.crash_match_status,
  ALL_EMS_COLUMNS.cris_crash_id,
  ALL_EMS_COLUMNS.non_cr3_match_status,
  ALL_EMS_COLUMNS.atd_apd_blueform_case_id,
];
