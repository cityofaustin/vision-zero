"use client";

import { useRef } from "react";
import { useQuery } from "@/utils/graphql";
import { GET_CRASH } from "@/queries/crash";
import { Crash } from "@/types/crashes";
import { useDocumentTitle } from "@/utils/documentTitle";
import { formatAddresses } from "@/utils/formatters";
import { formatYear } from "@/utils/formatters";
import { Row, Col } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { notFound } from "next/navigation";
import { Card } from "react-bootstrap";
import { MapRef } from "react-map-gl";
import { formatIsoDateTimeWithDay } from "@/utils/formatters";
import { PointMap } from "@/components/PointMap";

export default function FatalCrashDetailsPage({
  params,
}: {
  params: { record_locator: string };
}) {
  const mapRef = useRef<MapRef | null>(null);
  const recordLocator = params.record_locator;

  const typename = "crashes";

  const { data, error } = useQuery<Crash>({
    query: recordLocator ? GET_CRASH : null,
    variables: { recordLocator },
    typename,
  });

  if (error) {
    console.error(error);
  }

  // Set document title based on loaded data
  useDocumentTitle(
    data && data.length > 0
      ? `Fatalities ${data[0].record_locator} - ${formatAddresses(data[0])}`
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

  console.log(crash);

  return (
    <>
      <Row>
        <div className="d-flex justify-content-between mb-3">
          <span className="fs-3 fw-bold text-uppercase">
            {formatAddresses(data[0])}
          </span>
          <span className="fs-4">
            {formatYear(data[0].crash_timestamp)} Fatal Crash #
            {data[0].law_enforcement_ytd_fatality_num}
          </span>
        </div>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Table>
                <tbody>
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
                    <td></td>
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
                      {crash.is_coa_roadway === true
                        ? "City of Austin"
                        : "TxDOT"}
                    </td>
                  </tr>
                </tbody>
              </Table>
              <Row className="p-1 crash-header-card-body">
                <PointMap
                  savedLatitude={crash.latitude}
                  savedLongitude={crash.longitude}
                  mapRef={mapRef}
                />
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col></Col>
      </Row>
    </>
  );
}
