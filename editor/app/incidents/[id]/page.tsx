"use client";
import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { FaRoad } from "react-icons/fa6";
import { useQuery } from "@/utils/graphql";
import UserEventsLogger from "@/components/UserEventsLogger";
import { GET_INCIDENT } from "@/queries/incident";
import { VzIncidentListRow } from "@/types/vzIncidentList";
import IncidentMapCard from "@/components/IncidentMapCard";
import {
  LuAmbulance,
  LuFlame,
  LuClipboardPen,
  LuHeadset,
} from "react-icons/lu";
import { RiPoliceBadgeLine } from "react-icons/ri";
import { formatYesNoString, formatIsoDateTime } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { CadIncident } from "@/types/cadIncident";
import RelatedRecordTable from "@/components/RelatedRecordTable";
import { crashesColumns } from "@/configs/crashesColumns";
import { Crash } from "@/types/crashes";
import { EMSPatientCareRecord } from "@/types/ems";
import { ALL_EMS_COLUMNS } from "@/configs/emsColumns";
import { IconType } from "react-icons";

const RECORD_TYPE_BADGES: Record<string, RecordTypeBadgeProps> = {
  cad_apd: {
    icon: RiPoliceBadgeLine,
    colorClass: "primary",
    label: "Police",
  },
  cad_ems: {
    icon: LuAmbulance,
    colorClass: "danger",
    label: "EMS",
  },
  cad_afd: {
    icon: LuFlame,
    colorClass: "danger",
    label: "Fire",
  },
  crashes: {
    icon: LuClipboardPen,
    colorClass: "secondary",
    label: "Crash report",
  },
};

export const cadColumns: ColDataCardDef<CadIncident>[] = [
  {
    path: "agency_type_short",
    label: "Agency",
    sortable: true,
    // style: { textTransform: "uppercase" },
    valueRenderer: (record: CadIncident) => (
      <RecordTypeBadge
        {...RECORD_TYPE_BADGES["cad_" + record.agency_type_short || ""]}
      />
    ),
  },
  {
    path: "response_date",
    label: "Date",
    sortable: true,
    style: { minWidth: "8rem" },
    valueFormatter: formatIsoDateTime,
    fetchAlways: true,
  },
  {
    path: "address",
    label: "Address",
    sortable: true,
  },
  {
    path: "time_first_unit_arrived",
    label: "On scene",
    valueFormatter: formatYesNoString,
  },
  {
    path: "initial_problem",
    label: "Initial problem",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "final_problem",
    label: "Final problem",
    sortable: true,
  },
  {
    path: "call_disposition",
    label: "Call disposition",
    sortable: true,
  },

  {
    path: "incident_type",
    label: "Type",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "priority_description",
    label: "Priority",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "master_incident_number",
    label: "Incident number",
    sortable: true,
  },
  {
    path: "is_cancelled_call",
    label: "Canceled call",
    sortable: true,
    valueFormatter: formatYesNoString,
    defaultHidden: true,
  },
  {
    path: "in_austin_full_purpose",
    label: "In Austin Full Purpose",
    sortable: true,
    defaultHidden: true,
    valueFormatter: formatYesNoString,
  },
  {
    path: "location_id",
    label: "Location ID",
    sortable: true,
    defaultHidden: true,
  },
];

const crashColumns: ColDataCardDef<Crash>[] = [
  crashesColumns.record_locator_hyperlinked,
  crashesColumns.address_display,
  crashesColumns.crash_timestamp,
  crashesColumns.collsn,
  crashesColumns.agency,
  crashesColumns.private_dr_fl,
  crashesColumns.in_austin_full_purpose,
  crashesColumns.location_id,
];

const emsColumns: ColDataCardDef<EMSPatientCareRecord>[] = [
  ALL_EMS_COLUMNS.incident_number,
  ALL_EMS_COLUMNS.incident_received_datetime_with_timestamp,
  ALL_EMS_COLUMNS.incident_location_address,
  ALL_EMS_COLUMNS.travel_mode,
  ALL_EMS_COLUMNS.patient_injry_sev,
  ALL_EMS_COLUMNS.pcr_transport_destination,
  ALL_EMS_COLUMNS.cris_crash_id,
  ALL_EMS_COLUMNS.crash_match_status,
  { ...ALL_EMS_COLUMNS.person_match_status, defaultHidden: true },
];

interface RecordTypeBadgeProps {
  icon: IconType;
  label: string;
  colorClass: "primary" | "danger" | "secondary";
}

function RecordTypeBadge({
  icon: Icon,
  label,
  colorClass,
}: RecordTypeBadgeProps) {
  return (
    <div className="d-flex">
      <span className="rounded-5 bg-light py-2 px-3 flex-shrink-1 d-flex align-items-center border border-secondary-subtle">
        <Icon className={`text-${colorClass} fs-4 me-2`} />
        {<span className="fw-light fs-6 text-dark">{label}</span>}
      </span>
    </div>
  );
}

export default function IncidentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, error, isValidating, refetch } = useQuery<VzIncidentListRow>({
    query: GET_INCIDENT,
    variables: {
      id,
    },
    typename: "vz_incidents_view",
  });

  console.log(data, error, isValidating);
  const incident = data?.[0];
  /**
   * Set the title of the page inside the HTML head element
   */
  useEffect(() => {
    if (incident) {
      document.title = `VZ ${incident.id} - ${incident.address}`;
    }
  }, [incident]);

  if (!data) {
    return;
  }

  if (!incident) {
    notFound();
  }

  return (
    <UserEventsLogger eventName="incident_details_view">
      <Row>
        <Col className="d-flex fs-3 align-items-center mb-3">
          <FaRoad className="me-2" />
          <span>{incident.address}</span>
        </Col>
      </Row>
      <Row className="mb-3 justify-content-between">
        <Col xs="auto">
          <Row>
            {incident.cad_incidents?.some(
              (c) => c.agency_type_short === "apd"
            ) && (
              <Col xs="auto" className="px-1">
                <RecordTypeBadge {...RECORD_TYPE_BADGES.cad_apd} />
              </Col>
            )}
            {incident.cad_incidents?.some(
              (c) => c.agency_type_short === "afd"
            ) && (
              <Col xs="auto" className="px-1">
                <RecordTypeBadge {...RECORD_TYPE_BADGES.cad_afd} />
              </Col>
            )}
            {incident.cad_incidents?.some(
              (c) => c.agency_type_short === "ems"
            ) && (
              <Col xs="auto" className="px-1">
                <RecordTypeBadge {...RECORD_TYPE_BADGES.cad_ems} />
              </Col>
            )}
            {incident?.crashes && (
              <Col xs="auto" className="px-1">
                <RecordTypeBadge {...RECORD_TYPE_BADGES.crashes} />
              </Col>
            )}
          </Row>
        </Col>
      </Row>
      <Row>
        <Col sm={12} className="mb-3">
          {incident.cad_incidents && (
            <IncidentMapCard cadIncidents={incident.cad_incidents} />
          )}
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          {incident.cad_incidents && (
            <RelatedRecordTable<CadIncident>
              header={
                <div className="d-flex align-items-center">
                  <span className="me-2 d-flex align-items-center">
                    <LuHeadset className={`text-secondary fs-4`} />
                  </span>
                  <span className="fs-5 fw-bold">Dispatch</span>
                </div>
              }
              columns={cadColumns}
              records={incident.cad_incidents}
              mutation=""
              shouldShowColumnVisibilityPicker
              localStorageKey="vzIncidentsCadTableColVisibility"
              noRowsMessage="No dispatch records"
            />
          )}
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          {incident.crashes && (
            <RelatedRecordTable<Crash>
              header={
                <div className="d-flex align-items-center">
                  <span className="me-2 d-flex align-items-center">
                    <LuClipboardPen className={`text-secondary fs-4`} />
                  </span>
                  <span className="fs-5 fw-bold">Crash reports</span>
                </div>
              }
              columns={crashColumns}
              records={incident.crashes}
              mutation=""
              noRowsMessage="No crash reports"
              shouldShowColumnVisibilityPicker
              localStorageKey="vzIncidentsCrashesTableColVisibility"
            />
          )}
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          {incident.ems__incidents && (
            <RelatedRecordTable<EMSPatientCareRecord>
              header={
                <div className="d-flex align-items-center">
                  <span className="me-2 d-flex align-items-center">
                    <LuAmbulance className={`text-secondary fs-4`} />
                  </span>
                  <span className="fs-5 fw-bold">EMS Patient care</span>
                </div>
              }
              columns={emsColumns}
              records={incident.ems__incidents}
              mutation=""
              noRowsMessage="No patient care records"
              shouldShowColumnVisibilityPicker
              localStorageKey="vzIncidentsEmsTableColVisibility"
            />
          )}
        </Col>
      </Row>
    </UserEventsLogger>
  );
}
