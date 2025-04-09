"use client";
import { notFound } from "next/navigation";
import { useCallback, useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import DataCard from "@/components/DataCard";
import { emsDataCards } from "@/configs/emsDataCards";
import { useQuery } from "@/utils/graphql";
import { commonValidations } from "@/utils/formHelpers";
import { GET_EMS_RECORD } from "@/queries/ems";
import { EMSPatientCareRecord } from "@/types/ems";

const typename = "ems__incidents";

export default function EMSDetailsPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const { data, error, isValidating, refetch } = useQuery<EMSPatientCareRecord>(
    {
      query: id ? GET_EMS_RECORD : null,
      // if ID is provided, query for it, coercing non-numbers to zero and
      // thereby triggering the 404
      variables: {
        id: commonValidations.isNumber(id) === true ? parseInt(id) : 0,
      },
      typename,
    }
  );

  const onSaveCallback = useCallback(async () => {
    await refetch();
  }, [refetch]);

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

  const record = data[0];

  return (
    <>
      <Row>
        <Col>
          <h3>{record.incident_location_address}</h3>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<EMSPatientCareRecord>
            record={record}
            isValidating={isValidating}
            title="Summary"
            columns={emsDataCards.summary}
            mutation={""}
            onSaveCallback={onSaveCallback}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<EMSPatientCareRecord>
            record={record}
            isValidating={isValidating}
            title="Patient"
            columns={emsDataCards.patient}
            mutation={""}
            onSaveCallback={onSaveCallback}
          />
        </Col>
      </Row>
    </>
  );
}
