import { getInjuryColorClass } from "@/utils/people";
import { ColDataCardDef } from "@/types/types";
import { EMSPatientCareRecord } from "@/types/ems";
import { formatDate, formatIsoDateTime } from "@/utils/formatters";
import Link from "next/link";
import { ClientError } from "graphql-request";
import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaRegCircleQuestion,
} from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";

export const formatCrashMatchStatus = (value: unknown) => {
  switch (value) {
    case "unmatched":
      return (
        <AlignedLabel>
          <FaTriangleExclamation className="text-secondary me-2" />
          <span>Unmatched</span>
        </AlignedLabel>
      );
    case "multiple_matches_by_automation":
      return (
        <AlignedLabel>
          <FaRegCircleQuestion className="text-secondary me-2" />
          <span>Multiple</span>
        </AlignedLabel>
      );
    case "matched_by_automation":
      return (
        <AlignedLabel>
          <FaCircleCheck className="text-success me-2 fs-5" />
          <span>Matched automatically</span>
        </AlignedLabel>
      );
    case "matched_by_manual_qa":
      return (
        <AlignedLabel>
          <FaCircleCheck className="text-success me-2" />
          <span>Matched by manual Q/A</span>
        </AlignedLabel>
      );
    case "unmatched_by_manual_qa":
      return (
        <AlignedLabel>
          <FaTriangleExclamation className="text-secondary me-2" />
          <span>Unmatched by review/QA</span>
        </AlignedLabel>
      );
    case "unmatched_by_automation":
      return (
        <AlignedLabel>
          <FaTriangleExclamation className="text-secondary me-2" />
          <span>Unmatched by automation</span>
        </AlignedLabel>
      );
    default:
      return "";
  }
};

export const formatMatchScore = (value: unknown) => {
  const score = Number(value);
  if (!score) return "";
  if (score >= 99) {
    return (
      <AlignedLabel>
        <FaCircleCheck className="text-success me-2 fs-5" />
        <span>High</span>
      </AlignedLabel>
    );
  } else {
    return (
      <AlignedLabel>
        <FaTriangleExclamation className="text-secondary me-2" />
        <span>Low</span>
      </AlignedLabel>
    );
  }
};

const formatMatchAttrName = (value: string) => {
  switch (value) {
    case "pos_in_vehicle":
      return "position in vehicle";
    case "travel_mode":
      return "travel mode";
    case "age_approx":
      return "age (approx)";
    case "transport_dest":
      return "transport destination";
    case "injury_severity":
      return "injury severity";
    default:
      return value;
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
    valueRenderer: (value) => formatCrashMatchStatus(value.crash_match_status),
    sortable: true,
  },
  person_match_status: {
    path: "person_match_status",
    label: "Person match status",
    valueRenderer: (value) => formatCrashMatchStatus(value.person_match_status),
    sortable: true,
  },
  person_match_attributes: {
    path: "person_match_attributes",
    label: "Person match attributes",
    valueRenderer: (record) => {
      if (!record.person_match_attributes) return "";
      return record.person_match_attributes
        .map((attr) => formatMatchAttrName(attr))
        .join("\n");
    },
    defaultHidden: true,
  },
  person_match_score: {
    path: "person_match_score",
    label: "Person match quality",
    valueRenderer: (record) => formatMatchScore(record.person_match_score),
    defaultHidden: true,
  },
  non_cr3_match_status: {
    path: "non_cr3_match_status",
    label: "Non-CR3 match status",
    valueRenderer: (value) =>
      formatCrashMatchStatus(value.non_cr3_match_status),
    sortable: true,
    defaultHidden: true,
  },
  atd_apd_blueform_case_id: {
    path: "atd_apd_blueform_case_id",
    label: "Non-CR3 Case ID",
    sortable: true,
    defaultHidden: true,
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
    defaultHidden: true,
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
  ALL_EMS_COLUMNS.patient_injry_sev,
  ALL_EMS_COLUMNS.patient_injry_sev_reason,
  ALL_EMS_COLUMNS.mvc_form_position_in_vehicle,
  ALL_EMS_COLUMNS.apd_incident_numbers,
  ALL_EMS_COLUMNS.crash_match_status,
  ALL_EMS_COLUMNS.person_match_status,
  ALL_EMS_COLUMNS.person_match_attributes,
  ALL_EMS_COLUMNS.person_match_score,
  ALL_EMS_COLUMNS.cris_crash_id,
  ALL_EMS_COLUMNS.non_cr3_match_status,
  ALL_EMS_COLUMNS.atd_apd_blueform_case_id,
];
