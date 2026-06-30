"use client";
import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import DataCard from "@/components/DataCard";
import { FaRoad } from "react-icons/fa6";
import { useQuery } from "@/utils/graphql";
import UserEventsLogger from "@/components/UserEventsLogger";
import { GET_INCIDENT } from "@/queries/incident";
import { VzIncident } from "@/types/vzIncident";
import { PointMap } from "@/components/PointMap";
import IncidentMapCard from "@/components/IncidentMapCard";

import Link from "next/link";
import { formatYesNoString, formatIsoDateTime } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { CadIncident } from "@/types/cadIncident";
import RelatedRecordTable from "@/components/RelatedRecordTable";

export const cadColumns: ColDataCardDef<CadIncident>[] = [
  {
    path: "agency_type_short",
    label: "Agency",
    sortable: true,
    style: { textTransform: "uppercase" },
  },
  //   {
  //     path: "master_incident_number",
  //     label: "Incident #",
  //     sortable: true,
  //   },
  {
    path: "response_date",
    label: "Date",
    sortable: true,
    style: { minWidth: "8rem" },
    valueFormatter: formatIsoDateTime,
    fetchAlways: true,
  },

  //   {
  //     path: "address",
  //     label: "Address",
  //     sortable: true,
  //   },
  {
    path: "time_first_unit_arrived",
    label: "On scene",
    valueFormatter: formatYesNoString,
  },
  {
    path: "call_disposition",
    label: "Call disposition",
    sortable: true,
  },
];

export default function IncidentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, error, isValidating, refetch } = useQuery<VzIncident>({
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
      document.title = `VZ ${incident.id} - ${incident.address_earliest}`;
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
          <span>{incident.address_earliest}</span>
        </Col>
      </Row>
      <Row>
        <Col className="mb-3">
          {incident.cad_incidents && (
            <RelatedRecordTable<CadIncident>
              header="CAD calls"
              columns={cadColumns}
              records={incident.cad_incidents}
              mutation=""
            />
          )}
        </Col>
        <Col sm={12} md={7} className="mb-3">
          {incident.cad_incidents && (
            <IncidentMapCard cadIncidents={incident.cad_incidents} />
          )}
        </Col>
      </Row>
    </UserEventsLogger>
  );
}
