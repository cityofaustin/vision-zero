"use client";
import { notFound } from "next/navigation";
import { useCallback, useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import DataCard from "@/components/DataCard";
import { emsDataCards } from "@/configs/emsDataCards";
import { useQuery } from "@/utils/graphql";
import { commonValidations } from "@/utils/formHelpers";
import { GET_EMS_RECORD, GET_MATCHING_CRASHES } from "@/queries/ems";
import { EMSPatientCareRecord } from "@/types/ems";
import RelatedRecordTable from "@/components/RelatedRecordTable";
import { Crash } from "@/types/crashes";
import { emsMatchingCrashesColumns } from "@/configs/emsMatchingCrashesColumns";

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
      typename: "ems__incidents",
    }
  );

  const record = data?.[0];

  const {
    data: matchingCrashes,
    // error: matchingCrashesError,
    // isValidating: isValidatingCrashMatches,
    // refetch: refetchMatchingCrashes,
  } = useQuery<Crash>({
    query: record?.matched_crash_pks ? GET_MATCHING_CRASHES : null,
    // if ID is provided, query for it, coercing non-numbers to zero and
    // thereby triggering the 404
    variables: {
      crash_pks: record?.matched_crash_pks,
    },
    typename: "crashes",
  });

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

  if (!record) {
    // 404
    notFound();
  }

  console.log("matchingCrashes", matchingCrashes);

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
      {matchingCrashes && (
        <Row>
          <Col sm={12} className="mb-3">
            <RelatedRecordTable
              records={matchingCrashes}
              isValidating={isValidating}
              noRowsMessage="No crashes found"
              header="Possible matching crashes"
              columns={emsMatchingCrashesColumns}
              mutation={""}
              onSaveCallback={onSaveCallback}
            />
          </Col>
        </Row>
      )}
    </>
  );
}
