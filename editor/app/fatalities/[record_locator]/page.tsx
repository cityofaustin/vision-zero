"use client";

import { notFound } from "next/navigation";
import { useRef, useCallback, use, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { MapRef } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import FatalityUnitsCards from "@/components/FatalityUnitsCards";
import CrashNarrativeEditableCard from "@/components/CrashNarrativeEditableCard";
import { GET_CRASH } from "@/queries/crash";
import { Crash } from "@/types/crashes";
import { useDocumentTitle } from "@/utils/documentTitle";
import { formatIsoDateTimeWithDay, formatYear } from "@/utils/formatters";
import { useQuery } from "@/utils/graphql";
import { UPDATE_CRASH } from "@/queries/crash";
import CrashDiagramCard from "@/components/CrashDiagramCard";
import DataCard from "@/components/DataCard";
import { crashesColumns } from "@/configs/crashesColumns";

const otherCardColumns = [
  crashesColumns.case_id,
  crashesColumns.law_enforcement_ytd_fatality_num,
  crashesColumns.light_cond,
  crashesColumns.crash_speed_limit,
  crashesColumns.obj_struck,
];

export default function FatalCrashDetailsPage({
  params,
}: {
  params: Promise<{ record_locator: string }>;
}) {
  const mapRef = useRef<MapRef | null>(null);
  
  const { record_locator: recordLocator } = use(params);

  const typename = "crashes";

  const { data, error, refetch } = useQuery<Crash>({
    query: recordLocator ? GET_CRASH : null,
    variables: { recordLocator },
    typename,
  });

  if (error) {
    console.error(error);
  }
  const onSaveCallback = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Set document title based on loaded data
  useDocumentTitle(
    data && data.length > 0
      ? `Fatalities ${data[0].record_locator} - ${data[0].address_display}`
      : "Vision Zero Editor",
    true // exclude the suffix
  );

  if (!data) {
    // todo: loading spinner (would be nice to use a spinner inside cards)
    return;
  }

  if (data.length === 0) {
    // 404
    notFound();
  }

  const crash = data[0];

  return (
    <>
      <Row>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fs-3 fw-bold text-uppercase">
            {data[0].address_display}
          </span>
          <span className="text-nowrap bg-light-use-theme py-2 rounded-3 px-3 border">
            <span className="fs-5 fw-bold me-1">Year</span>
            <span className="fs-5 me-3">
              {formatYear(data[0].crash_timestamp)}
            </span>
            <span className="fs-5 fw-bold me-1">Fatal Crash</span>
            <span className="fs-5">
              #{data[0].law_enforcement_ytd_fatality_num}
            </span>
          </span>
        </div>
      </Row>
      <Row>
        <Col className="mb-3" sm={12} md={6}>
          <Card className="h-100">
            <Card.Body>
              <Table>
                <tbody>
                  <tr>
                    <td className="fw-bold">Crash ID</td>
                    <td>
                      {crashesColumns.record_locator_hyperlinked.valueRenderer(
                        crash
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textWrap: "nowrap" }} className="fw-bold">
                      Date
                    </td>
                    <td>{formatIsoDateTimeWithDay(crash.crash_timestamp)}</td>
                  </tr>
                  <tr>
                    <td style={{ textWrap: "nowrap" }} className="fw-bold">
                      Units involved
                    </td>
                    <td>
                      {crash.unit_types_involved?.unit_types_involved || ""}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textWrap: "nowrap" }} className="fw-bold">
                      Collision type
                    </td>
                    <td>{crash.collsn?.label}</td>
                  </tr>
                  <tr>
                    <td style={{ textWrap: "nowrap" }} className="fw-bold">
                      Roadway owner
                    </td>
                    <td>
                      {crash.is_coa_roadway === true && "City of Austin"}
                      {crash.is_coa_roadway === false && "TxDOT"}
                    </td>
                  </tr>
                </tbody>
              </Table>
              <Row className="p-1 crash-header-card-body">
                <PointMap
                  savedLatitude={crash.latitude}
                  savedLongitude={crash.longitude}
                  mapRef={mapRef}
                  initialBasemapType="streets"
                />
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-3" sm={12} md={6}>
          <FatalityUnitsCards crash={crash} />
        </Col>
      </Row>
      <Row>
        <Col className="mb-3" sm={12} md={6} lg={4}>
          <CrashDiagramCard crash={crash} />
        </Col>
        <Col className="mb-3" sm={12} md={6} lg={4}>
          <CrashNarrativeEditableCard
            crash={crash}
            onSaveCallback={onSaveCallback}
          />
        </Col>
        <Col>
          <DataCard<Crash>
            record={crash}
            isValidating={false}
            title="Details"
            columns={otherCardColumns}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
            shouldShowColumnVisibilityPicker={true}
            localStorageKey="crashPageOther"
          />
        </Col>
      </Row>
    </>
  );
}
