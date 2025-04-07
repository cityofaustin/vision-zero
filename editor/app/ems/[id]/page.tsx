"use client";
import { notFound } from "next/navigation";
import { useCallback, useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useQuery } from "@/utils/graphql";
import { GET_EMS_RECORD } from "@/queries/ems";
import { EMSPatientCareRecord } from "@/types/ems";

const typename = "ems__incidents";

export default function CrashDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = useQuery<EMSPatientCareRecord>({
    query: params.id ? GET_EMS_RECORD : null,
    variables: { id: parseInt(params.id) || 0 },
    typename,
  });

  if (error) {
    console.error(error);
  }

  // When data is loaded or updated this sets the title of the page inside the HTML head element
  useEffect(() => {
    if (!!data && data.length > 0) {
      document.title = `EMS ${data[0].id} - ${data[0].incident_location_address}`;
    }
  }, [data]);

  if (!data) {
    // todo: loading spinner (would be nice to use a spinner inside cards)
    return;
  }

  if (data.length === 0) {
    // 404
    notFound();
  }

  const ems_pcr = data[0];

  return (
    <>
      <Row>
        <Col>
          <h3>{ems_pcr.incident_location_address}</h3>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <p>Future content here 👍</p>
        </Col>
      </Row>
    </>
  );
}
