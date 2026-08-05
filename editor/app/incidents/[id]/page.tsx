"use client";
import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {
  LuAmbulance,
  LuClipboardPen,
  LuFlame,
  LuHeadset,
} from "react-icons/lu";
import { afdColumns } from "@/configs/afdColumns";
import { ALL_EMS_COLUMNS } from "@/configs/emsColumns";
import { cadColumns } from "@/configs/cadColumns";
import { CadIncident } from "@/types/cadIncident";
import { ColDataCardDef } from "@/types/types";
import { Crash } from "@/types/crashes";
import { crashesColumns } from "@/configs/crashesColumns";
import { EMSPatientCareRecord } from "@/types/ems";
import { FaRoad } from "react-icons/fa6";
import { GET_INCIDENT } from "@/queries/incident";
import { useQuery } from "@/utils/graphql";
import { VzIncidentListRow } from "@/types/vzIncidentList";
import IncidentMapCard from "@/components/IncidentMapCard";
import RelatedRecordTable from "@/components/RelatedRecordTable";
import UserEventsLogger from "@/components/UserEventsLogger";
import { AfdIncident } from "@/types/afd";

const crashColumns: ColDataCardDef<Crash>[] = [
  crashesColumns.record_locator_hyperlinked,
  crashesColumns.crash_timestamp,
  crashesColumns.address_display,
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

export default function IncidentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data } = useQuery<VzIncidentListRow>({
    query: GET_INCIDENT,
    variables: {
      id,
    },
    typename: "vz_incidents_list_view",
  });

  const incident = data?.[0];

  useEffect(() => {
    if (incident) {
      document.title = `Incident ${incident.id} - ${incident.address}`;
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
      <Row>
        <Col sm={12} className="mb-3">
          {incident && <IncidentMapCard incident={incident} />}
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
      <Row className="mb-3">
        <Col>
          {incident.afd__incidents && (
            <RelatedRecordTable<AfdIncident>
              header={
                <div className="d-flex align-items-center">
                  <span className="me-2 d-flex align-items-center">
                    <LuFlame className={`text-secondary fs-4`} />
                  </span>
                  <span className="fs-5 fw-bold">AFD Incidents</span>
                </div>
              }
              columns={afdColumns}
              records={incident.afd__incidents}
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
